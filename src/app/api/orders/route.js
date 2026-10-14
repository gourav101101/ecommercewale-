import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { databaseSetupResponse } from '@/lib/database-response';
import Order from '@/models/Order';

export async function GET() {
  const setup = databaseSetupResponse();
  if (setup) return setup;
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  const setup = databaseSetupResponse();
  if (setup) return setup;
  try {
    await dbConnect();
    const data = await request.json();
    
    const newOrder = await Order.create(data);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
