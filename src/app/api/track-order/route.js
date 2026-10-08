import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    const { orderId, email } = await request.json();
    
    if (typeof orderId !== 'string' || typeof email !== 'string' || !orderId.trim() || orderId.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Order ID and Email are required' }, { status: 400 });
    }

    // Securely find the order that matches BOTH the ID and the Email
    await dbConnect();
    const order = await Order.findOne({ id: orderId.trim(), email: email.trim() }).select('id status date products total').lean();
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found or email does not match' }, { status: 404 });
    }
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track order' }, { status: 500 });
  }
}
