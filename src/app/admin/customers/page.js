'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Mail, Filter } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    (customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)) &&
    (filterStatus === 'all' || customer.status === filterStatus)
  );

  return (
    <div className="adminPanel">
      <div className="panelHeader">
        <h2>Customers List</h2>
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
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="panelBody">
        <div style={{ overflowX: 'auto' }}>
          <table className="adminTable">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>City</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                      {customer.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Mail size={12} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {customer.email}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {customer.phone}
                    </div>
                  </td>
                  <td>{customer.city}</td>
                  <td style={{ textAlign: 'center' }}>{customer.totalOrders}</td>
                  <td style={{ fontWeight: 600 }}>₹{customer.totalSpent.toLocaleString()}</td>
                  <td>
                    <span className={`customerStatus ${customer.status}`}>
                      <span
                        className="statusDot"
                        style={{ background: customer.status === 'active' ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                      />
                      {customer.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {customer.joinDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="emptyState">
              <h3>No customers found</h3>
              <p>Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
