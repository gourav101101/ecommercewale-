'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, RefreshCcw } from 'lucide-react';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(fetchInquiries);
  }, []);

  return (
    <div>
      <div className="panelHeader" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Customer Inquiries</h1>
        <button className="btn btn-outline btn-sm" onClick={() => { setLoading(true); fetchInquiries(); }}>
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem' }}>Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--color-bg-alt)', borderRadius: '8px' }}>
          <Mail size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>No customer inquiries found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {inquiries.map((inq) => (
            <div key={inq._id} style={{ 
              background: 'var(--color-bg-alt)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              border: '1px solid var(--color-border)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {inq.name}
                    <span className="badge" style={{ 
                      fontSize: '0.7rem', 
                      background: inq.formType === 'bulk' ? 'rgba(255, 107, 53, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: inq.formType === 'bulk' ? 'var(--color-primary)' : 'var(--color-info)'
                    }}>
                      {inq.formType === 'bulk' ? 'Bulk Order' : 'General'}
                    </span>
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {inq.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {inq.phone}</span>
                  </div>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {new Date(inq.createdAt).toLocaleString()}
                </div>
              </div>

              {inq.formType === 'bulk' && (
                <div style={{ 
                  background: 'var(--color-bg)', 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  marginBottom: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <div style={{ color: 'var(--color-text-muted)' }}>Company</div>
                    <div style={{ fontWeight: 500 }}>{inq.companyName}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-muted)' }}>Monthly Volume</div>
                    <div style={{ fontWeight: 500 }}>{inq.monthlyVolume}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-muted)' }}>Products Needed</div>
                    <div style={{ fontWeight: 500 }}>{inq.productsNeeded}</div>
                  </div>
                </div>
              )}

              <div style={{ 
                background: 'var(--color-bg)', 
                padding: '1rem', 
                borderRadius: '6px', 
                borderLeft: '3px solid var(--color-border)',
                lineHeight: 1.5
              }}>
                {inq.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
