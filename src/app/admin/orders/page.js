'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { statusColors, orderStatuses } from '@/data/admin';
import Modal from '@/components/ui/Modal/Modal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="adminPanel">
      <div className="panelHeader">
        <h2>Orders Management</h2>
        <button className="btn btn-outline btn-sm" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>
      
      <div className="adminToolbar">
        <div className="searchInputWrapper">
          <Search size={18} className="searchInputIcon" />
          <input
            type="text"
            className="searchInput"
            placeholder="Search by Order ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select 
            className="filterSelect"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {orderStatuses.map(status => (
              <option key={status} value={status} style={{ textTransform: 'capitalize' }}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panelBody">
        <div style={{ overflowX: 'auto' }}>
          <table className="adminTable">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    #{order.id}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {order.date}
                  </td>
                  <td>
                    <div>{order.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {order.email}
                    </div>
                  </td>
                  <td>{order.paymentMethod}</td>
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
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select 
                        className="filterSelect" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        defaultValue={order.status}
                      >
                        {orderStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-ghost btn-icon" 
                        style={{ padding: '4px' }}
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsModalOpen(true);
                        }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="emptyState">
              <h3>No orders found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order Details - #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="grid-2">
              <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Customer Information</h4>
                <div style={{ fontWeight: '500' }}>{selectedOrder.customer}</div>
                <div style={{ fontSize: '0.9rem' }}>{selectedOrder.email}</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Order Information</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Date:</span> <span style={{ fontWeight: '500' }}>{selectedOrder.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment:</span> <span style={{ fontWeight: '500' }}>{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 1rem 0' }}>Order Summary</h4>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span>Total Items ({selectedOrder.items})</span>
                  <span>Multiple Products</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-alt)', fontWeight: 'bold' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button 
                className="btn btn-outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
