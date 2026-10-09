'use client';

import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { statusColors } from '@/data/admin';

const iconMap = {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
};

const iconColors = [
  { bg: 'rgba(255, 107, 53, 0.12)', color: 'var(--color-primary)' },
  { bg: 'rgba(0, 201, 167, 0.12)', color: 'var(--color-secondary)' },
  { bg: 'rgba(124, 92, 252, 0.12)', color: 'var(--color-accent)' },
  { bg: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-info)' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Dashboard unavailable');
        const json = await res.json();
        if (!Array.isArray(json.stats) || !Array.isArray(json.recentOrders) || !Array.isArray(json.topProducts)) throw new Error('Invalid dashboard response');
        setData(json);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading dashboard data...</div>;
  }

  if (!data) {
    return <div className="adminNotice" role="alert">Dashboard unavailable. Check the MongoDB connection and try again. <button onClick={() => location.reload()}>Retry</button><p>Supplier review is available independently of the store database.</p><Link href="/admin/suppliers">Open supplier review</Link></div>;
  }

  const { stats, recentOrders, topProducts } = data;

  return (
    <div>
      <div className="adminNotice">These figures reflect recorded database orders. WhatsApp enquiries are not automatically saved as orders, and delivered order value is not a payment-received report.</div>
      {/* Stats Grid */}
      <div className="statsGrid">
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Package;
          return (
            <div key={stat.id} className="statCard">
              <div className="statCardHeader">
                <div
                  className="statCardIcon"
                  style={{ background: iconColors[i].bg, color: iconColors[i].color }}
                >
                  <Icon size={22} />
                </div>
                <span className={`statCardChange ${stat.trend}`}>
                  {stat.trend === 'up' && <TrendingUp size={12} />}
                  {stat.change}
                </span>
              </div>
              <div className="statCardValue">{stat.value}</div>
              <div className="statCardLabel">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="contentGrid">
        {/* Recent Orders */}
        <div className="adminPanel">
          <div className="panelHeader">
            <h2>Recent Orders</h2>
            <Link href="/admin/orders" className="btn btn-ghost btn-sm">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="panelBody">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      #{order.id}
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td style={{ fontWeight: 600 }}>₹{order.total.toLocaleString()}</td>
                    <td>
                      <span
                        className="statusBadge"
                        style={{
                          background: statusColors[order.status].bg,
                          color: statusColors[order.status].color,
                        }}
                      >
                        <span
                          className="statusDot"
                          style={{ background: statusColors[order.status].color }}
                        />
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="adminPanel">
          <div className="panelHeader">
            <h2>Top Products</h2>
            <Link href="/admin/products" className="btn btn-ghost btn-sm">
              <Eye size={14} /> View All
            </Link>
          </div>
          <div className="panelBody">
            {topProducts.map((product, i) => (
              <div key={i} className="topProductItem">
                <div className="topProductRank">{i + 1}</div>
                <div className="topProductInfo">
                  <div className="topProductName">{product.name}</div>
                  <div className="topProductSales">{product.sales} sales</div>
                </div>
                <div className="topProductRevenue">{product.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
