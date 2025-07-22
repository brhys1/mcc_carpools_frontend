import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/drivers`, {
    headers: {
      'x-api-key': process.env.API_KEY,
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req) {
  const body = await req.json();
  const res = await fetch(`${process.env.BACKEND_URL}/api/drivers`, {
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
