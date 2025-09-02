import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const body = await req.json();
  const { drive_id } = params;
  const res = await fetch(`${process.env.BACKEND_URL}/api/drives/${drive_id}/remove-rider`, {
    method: 'POST',
    headers: {
      'x-api-key': process.env.API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
