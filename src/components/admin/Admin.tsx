"use client";

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';

interface Slot {
  start: string | null;
  end: string | null;
  driver?: string | null;
}

interface Ride {
  drive_id: string;
  date: string;
  driver_name: string;
  start_time: string;
  end_time: string;
}

interface AdminRider {
  id: string;
  name: string;
  email: string;
  phone: string;
  divisions: string[];
  availability: { [date: string]: Slot[] };
  rides: Ride[];
  unmatched: boolean;
}

interface AdminDrive {
  id: string;
  date: string;
  driver_name: string;
  driver_email: string;
  driver_phone: string;
  pickup_address: string;
  start_time: string;
  end_time: string;
  total_capacity: number;
  riders: { id: string; name: string; email: string; phone: string }[];
}

interface WeekData {
  start: string;
  end: string;
  days: string[];
  drives: AdminDrive[];
  riders: AdminRider[];
}

interface DashboardData {
  today: string;
  currentWeek: WeekData;
  nextWeek: WeekData;
}

const NAVY = '#00274C';
const MAIZE = '#FFCB05';

const DIVISION_LABELS: { [key: string]: string } = {
  kerrytown: 'Kerrytown',
  central: 'Central',
  hill: 'Hill',
  lower_bp: 'Lower BP',
  upper_bp: 'Upper BP',
  pierpont: 'Pierpont',
};

const shortDay = (label: string) => {
  const [day, date] = label.split(', ');
  return `${day.slice(0, 3)} ${date?.slice(0, 5) ?? ''}`;
};

// Stored times look like "7:00 PM" or "19:00 PM"; normalise to "7:00 PM"
const formatTime = (time: string | null | undefined) => {
  if (!time || !time.includes(':')) return time || '';
  const [hourStr, rest] = time.toUpperCase().split(':');
  const [minute, ampm = ''] = rest.trim().split(/\s+/);
  let hour = Number(hourStr);
  if (hour < 13) {
    if (ampm === 'PM' && hour !== 12) hour += 12;
    else if (ampm === 'AM' && hour === 12) hour = 0;
  }
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const formatRange = (start: string | null | undefined, end: string | null | undefined) => {
  if (start && end) return `${formatTime(start)} – ${formatTime(end)}`;
  if (start) return `from ${formatTime(start)}`;
  if (end) return `until ${formatTime(end)}`;
  return 'Any time';
};

const LoginForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axios.post('/api/admin/login', { password });
      onSuccess();
    } catch {
      setError('Incorrect password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ color: NAVY, fontWeight: 'bold', mb: 2 }}>
          Admin Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            type="password"
            label="Password"
            fullWidth
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(error)}
            helperText={error}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || !password}
            sx={{ mt: 2, backgroundColor: NAVY }}
          >
            {submitting ? 'Checking…' : 'Log in'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

const DrivesSection: React.FC<{ week: WeekData }> = ({ week }) => {
  if (week.drives.length === 0) {
    return <Typography color="text.secondary">No cars signed up for this week yet.</Typography>;
  }
  return (
    <>
      {week.days
        .filter((day) => week.drives.some((d) => d.date === day))
        .map((day) => (
          <Box key={day} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: NAVY, mb: 1 }}>
              {day}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Driver</TableCell>
                    <TableCell>Pickup</TableCell>
                    <TableCell>Seats</TableCell>
                    <TableCell>Riders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {week.drives
                    .filter((d) => d.date === day)
                    .map((drive) => (
                      <TableRow key={drive.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatRange(drive.start_time, drive.end_time)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{drive.driver_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {[drive.driver_email, drive.driver_phone].filter(Boolean).join(' · ')}
                          </Typography>
                        </TableCell>
                        <TableCell>{drive.pickup_address}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={`${drive.riders.length}/${drive.total_capacity}`}
                            color={drive.riders.length === 0 ? 'default' : drive.riders.length >= drive.total_capacity ? 'success' : 'primary'}
                          />
                        </TableCell>
                        <TableCell>
                          {drive.riders.length === 0
                            ? <Typography variant="body2" color="text.secondary">—</Typography>
                            : drive.riders.map((r) => (
                              <Typography key={r.id} variant="body2">{r.name}</Typography>
                            ))}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
    </>
  );
};

const RidersSection: React.FC<{ week: WeekData; flagUnmatched: boolean }> = ({ week, flagUnmatched }) => {
  if (week.riders.length === 0) {
    return <Typography color="text.secondary">No one has put in availability for this week yet.</Typography>;
  }
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Rider</TableCell>
            <TableCell>Divisions</TableCell>
            {week.days.map((day) => (
              <TableCell key={day} sx={{ whiteSpace: 'nowrap' }}>{shortDay(day)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {week.riders.map((rider) => {
            const flagged = flagUnmatched && rider.unmatched;
            return (
              <TableRow key={rider.id} sx={flagged ? { backgroundColor: '#fff4e5' } : undefined}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{rider.name}</Typography>
                    {flagged && (
                      <Chip size="small" color="warning" icon={<WarningAmberIcon />} label="Not matched" />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {[rider.email, rider.phone].filter(Boolean).join(' · ')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {rider.divisions.map((d) => DIVISION_LABELS[d] || d).join(', ') || '—'}
                  </Typography>
                </TableCell>
                {week.days.map((day) => {
                  const rides = rider.rides.filter((r) => r.date === day);
                  const slots = rider.availability[day] || [];
                  return (
                    <TableCell key={day} sx={{ verticalAlign: 'top', minWidth: 110 }}>
                      {rides.map((ride) => (
                        <Chip
                          key={ride.drive_id}
                          size="small"
                          color="success"
                          icon={<DirectionsCarIcon />}
                          label={`${ride.driver_name} ${formatTime(ride.start_time)}`}
                          sx={{ mb: 0.5, maxWidth: '100%' }}
                        />
                      ))}
                      {rides.length === 0 && slots.map((slot, i) => (
                        <Typography key={i} variant="caption" display="block" sx={{ whiteSpace: 'nowrap' }}>
                          {formatRange(slot.start, slot.end)}
                        </Typography>
                      ))}
                      {rides.length === 0 && slots.length === 0 && (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const WeekView: React.FC<{ week: WeekData; isCurrent: boolean }> = ({ week, isCurrent }) => {
  const seats = week.drives.reduce((sum, d) => sum + d.total_capacity, 0);
  const filled = week.drives.reduce((sum, d) => sum + d.riders.length, 0);
  const unmatched = week.riders.filter((r) => r.unmatched);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <Chip label={`${week.drives.length} cars`} sx={{ backgroundColor: NAVY, color: 'white' }} />
        <Chip label={`${filled}/${seats} seats filled`} variant="outlined" />
        <Chip label={`${week.riders.length} riders with availability`} variant="outlined" />
        {isCurrent && (
          <Chip
            label={`${unmatched.length} not matched`}
            color={unmatched.length ? 'warning' : 'success'}
          />
        )}
      </Box>

      {isCurrent && unmatched.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Not matched this week:</strong> {unmatched.map((r) => r.name).join(', ')}
        </Alert>
      )}

      <Typography variant="h6" sx={{ color: NAVY, fontWeight: 'bold', mb: 2 }}>
        Cars
      </Typography>
      <DrivesSection week={week} />

      <Typography variant="h6" sx={{ color: NAVY, fontWeight: 'bold', mt: 4, mb: 1 }}>
        Rider availability
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Green chips are confirmed rides. Matched days no longer show the rider&apos;s original time range.
      </Typography>
      <RidersSection week={week} flagUnmatched={isCurrent} />
    </Box>
  );
};

const Admin: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/dashboard');
      setData(res.data);
      setNeedsLogin(false);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setNeedsLogin(true);
      } else {
        setError(e.response?.data?.error || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    await axios.delete('/api/admin/login');
    setData(null);
    setNeedsLogin(true);
  };

  if (needsLogin) return <LoginForm onSuccess={load} />;

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const week = data ? (tab === 0 ? data.currentWeek : data.nextWeek) : null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: NAVY, fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>
          {data && <Typography color="text.secondary">Today: {data.today}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading} variant="outlined">
            Refresh
          </Button>
          <Button startIcon={<LogoutIcon />} onClick={logout} variant="outlined" color="inherit">
            Log out
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {data && week && (
        <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: `3px solid ${MAIZE}` }}
          >
            <Tab label={`This week (${shortDay(data.currentWeek.start)} – ${shortDay(data.currentWeek.end)})`} />
            <Tab label={`Next week (${shortDay(data.nextWeek.start)} – ${shortDay(data.nextWeek.end)})`} />
          </Tabs>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <WeekView week={week} isCurrent={tab === 0} />
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Admin;
