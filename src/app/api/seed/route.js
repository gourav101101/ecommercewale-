import { NextResponse } from 'next/server';

// Database resets must never be available through a public web request.
export async function GET() {
  return NextResponse.json({ error: 'Remote database seeding is disabled.' }, { status: 403 });
}
