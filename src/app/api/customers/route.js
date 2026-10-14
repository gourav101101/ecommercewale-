import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { databaseSetupResponse } from '@/lib/database-response';
import Customer from '@/models/Customer';

export async function GET() {
  const setup = databaseSetupResponse();
  if (setup) return setup;
  try {
    await dbConnect();
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
