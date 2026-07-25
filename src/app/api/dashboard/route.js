import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Customer from '@/models/Customer';

export async function GET() {
  try {
    await dbConnect();
    
    // Total Revenue (all orders for now, or just delivered)
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    const totalProducts = await Product.countDocuments({});
    const totalCustomers = await Customer.countDocuments({});

    // Recent 8 orders
    const recentOrders = await Order.find({}).sort({ date: -1 }).limit(8);

    // Top 5 Products (by reviewCount as a proxy for sales since we don't track sales yet)
    const topProductsRaw = await Product.find({}).sort({ reviewCount: -1 }).limit(5);
    const topProducts = topProductsRaw.map(p => ({
      name: p.shortName || p.name,
      sales: p.reviewCount * 3 + Math.floor(Math.random() * 50), // Mocking sales numbers based on reviews
      revenue: `₹${(p.basePrice * (p.reviewCount * 3)).toLocaleString()}`
    }));

    return NextResponse.json({
      stats: [
        { id: 'revenue', label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '+12.5%', trend: 'up', icon: 'IndianRupee' },
        { id: 'orders', label: 'Total Orders', value: totalOrders.toLocaleString(), change: '+8.2%', trend: 'up', icon: 'ShoppingBag' },
        { id: 'products', label: 'Active Products', value: totalProducts.toLocaleString(), change: '0%', trend: 'neutral', icon: 'Package' },
        { id: 'customers', label: 'Customers', value: totalCustomers.toLocaleString(), change: '+15.3%', trend: 'up', icon: 'Users' },
      ],
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
