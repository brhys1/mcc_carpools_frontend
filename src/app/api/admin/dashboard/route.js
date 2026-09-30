import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const TIMEZONE = 'America/Detroit';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Today's date in Ann Arbor, as a UTC-midnight Date so day arithmetic is timezone-safe
function todayLocal() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Matches the backend/frontend key format: "Monday, 10/06/26"
function dateLabel(date) {
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const yy = String(date.getUTCFullYear()).slice(-2);
  return `${DAY_NAMES[date.getUTCDay()]}, ${mm}/${dd}/${yy}`;
}

function weekLabels(monday) {
  return Array.from({ length: 7 }, (_, i) => dateLabel(addDays(monday, i)));
}

// Times are stored like "7:00 PM" or "19:00 PM"; mirrors backend time_to_minutes
function timeToMinutes(time) {
  if (!time || !time.includes(':')) return 0;
  const [hourStr, rest] = time.toUpperCase().split(':');
  const [minuteStr, ampm = ''] = rest.trim().split(/\s+/);
  let hour = Number(hourStr);
  const minute = Number(minuteStr) || 0;
  if (hour < 13) {
    if (ampm === 'PM' && hour !== 12) hour += 12;
    else if (ampm === 'AM' && hour === 12) hour = 0;
  }
  return hour * 60 + minute;
}

async function backendGet(path) {
  const res = await fetch(`${process.env.BACKEND_URL}${path}`, {
    headers: { 'x-api-key': process.env.API_KEY },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Backend ${path} returned ${res.status}`);
  return res.json();
}

function buildWeek(monday, allDrives, allRiders) {
  const days = weekLabels(monday);
  const labelByKey = Object.fromEntries(days.map((d) => [d.toLowerCase(), d]));
  const ridersById = Object.fromEntries(allRiders.map((r) => [r.id, r]));

  const drives = allDrives
    .filter((d) => d.date && labelByKey[d.date.toLowerCase()])
    .map((d) => ({
      id: d.id,
      date: labelByKey[d.date.toLowerCase()],
      driver_name: d.driver_name || 'Unknown',
      driver_email: d.driver_email || '',
      driver_phone: d.driver_phone || d.phone || '',
      pickup_address: d.pickup_address || '',
      start_time: d.start_time || '',
      end_time: d.end_time || '',
      total_capacity: Number(d.total_capacity) || 0,
      riders: (d.paired_riders || []).map((id) => {
        const r = ridersById[id];
        return { id, name: r?.name || 'Unknown rider', email: r?.email || '', phone: r?.phone || '' };
      }),
    }))
    .sort((a, b) => days.indexOf(a.date) - days.indexOf(b.date)
      || timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  const ridesByRider = {};
  for (const drive of drives) {
    for (const r of drive.riders) {
      (ridesByRider[r.id] ||= []).push({
        drive_id: drive.id,
        date: drive.date,
        driver_name: drive.driver_name,
        start_time: drive.start_time,
        end_time: drive.end_time,
      });
    }
  }

  const riders = allRiders
    .map((r) => {
      const availability = {};
      for (const [key, slots] of Object.entries(r.availability || {})) {
        const label = labelByKey[key.toLowerCase()];
        if (label && Array.isArray(slots) && slots.length) availability[label] = slots;
      }
      const rides = ridesByRider[r.id] || [];
      return {
        id: r.id,
        name: r.name || 'Unknown',
        email: r.email || '',
        phone: r.phone || '',
        divisions: Object.entries(r.divisions || {}).filter(([, on]) => on).map(([k]) => k),
        availability,
        rides,
        unmatched: rides.length === 0,
      };
    })
    .filter((r) => Object.keys(r.availability).length || r.rides.length)
    .sort((a, b) => Number(b.unmatched) - Number(a.unmatched) || a.name.localeCompare(b.name));

  return { start: days[0], end: days[6], days, drives, riders };
}

export async function GET(req) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [allRiders, allDrives] = await Promise.all([
      backendGet('/api/riders'),
      backendGet('/api/drives'),
    ]);
    const today = todayLocal();
    const monday = addDays(today, -((today.getUTCDay() + 6) % 7));
    return NextResponse.json({
      today: dateLabel(today),
      currentWeek: buildWeek(monday, allDrives, allRiders),
      nextWeek: buildWeek(addDays(monday, 7), allDrives, allRiders),
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
