import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Customer from '@/models/Customer';

import { products } from '@/data/products';
import { recentOrders, customers } from '@/data/admin';

export async function GET() {
  try {
    await dbConnect();

    // Clear existing data to avoid duplicates
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Customer.deleteMany({});

    // Seed Products
    // Make sure we convert string IDs from customers to strings if needed
    const seededProducts = await Product.insertMany(products);
    
    // Seed Orders
    const seededOrders = await Order.insertMany(recentOrders);
    
    // Seed Customers (ensure id is string since our schema expects string)
    const formattedCustomers = customers.map(c => ({
      ...c,
      id: c.id.toString()
    }));
    const seededCustomers = await Customer.insertMany(formattedCustomers);

    return NextResponse.json({
      message: 'Database seeded successfully',
      counts: {
        products: seededProducts.length,
        orders: seededOrders.length,
        customers: seededCustomers.length
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
