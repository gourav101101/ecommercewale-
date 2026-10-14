import { NextResponse } from 'next/server';

export function databaseSetupResponse() {
  if (process.env.MONGODB_URI) return null;
  return NextResponse.json({
    requiresSetup: true,
    error: 'Database not connected. Configure MONGODB_URI to use this feature. No changes were saved.',
  }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
