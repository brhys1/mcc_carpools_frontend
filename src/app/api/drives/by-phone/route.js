import { NextResponse } from 'next/server';

export async function DELETE(req) {
  const body = await req.json();
  const res = await fetch(`${process.env.BACKEND_URL}/api/drives/by-phone`, {
    method: 'DELETE',
    headers: {
      'x-api-key': process.env.API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
