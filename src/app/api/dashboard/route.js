import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Customer from '@/models/Customer';

export async function GET() {
  try {
    await dbConnect();
    
    // Recorded delivered-order values are not proof of payment received.
    const orders = await Order.find({}).lean();
    const delivered = orders.filter(order => order.status === 'delivered');
    const totalRevenue = delivered.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const totalOrders = orders.length;

    const totalProducts = await Product.countDocuments({});
    const totalCustomers = await Customer.countDocuments({});

    // Recent 8 orders
    const recentOrders = await Order.find({}).sort({ date: -1 }).limit(8);

    const grouped = new Map();
    for (const order of delivered) for (const item of order.products || []) {
      const key = item.id || item.name;
      const previous = grouped.get(key) || { name: item.name || 'Product', sales: 0, amount: 0 };
      const units = Math.max(0, Number(item.quantity) || 0);
      previous.sales += units;
      previous.amount += units * Math.max(0, Number(item.price) || 0);
      grouped.set(key, previous);
    }
    const topProducts = [...grouped.values()].sort((a, b) => b.sales - a.sales).slice(0, 5).map(product => ({ name: product.name, sales: product.sales, revenue: `₹${product.amount.toLocaleString('en-IN')}` }));

    return NextResponse.json({
      stats: [
        { id: 'revenue', label: 'Delivered order value', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: 'Recorded', trend: 'neutral', icon: 'IndianRupee' },
        { id: 'orders', label: 'Recorded orders', value: totalOrders.toLocaleString(), change: '', trend: 'neutral', icon: 'ShoppingBag' },
        { id: 'products', label: 'Catalogue products', value: totalProducts.toLocaleString(), change: '', trend: 'neutral', icon: 'Package' },
        { id: 'customers', label: 'Customers', value: totalCustomers.toLocaleString(), change: '', trend: 'neutral', icon: 'Users' },
      ],
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
