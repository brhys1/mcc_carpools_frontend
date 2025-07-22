import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/sheets`, {
    headers: {
      'x-api-key': process.env.API_KEY,
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
