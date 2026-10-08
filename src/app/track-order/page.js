'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Box, X, MessageCircle } from 'lucide-react';
import { whatsappUrl } from '@/lib/whatsapp';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email })
      });
      
      if (!res.ok) {
        throw new Error('Order not found or email does not match.');
      }
      
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { id: 'pending', label: 'Order Placed', icon: Package },
    { id: 'processing', label: 'Processing', icon: Box },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
  ];

  const getStepStatus = (stepId, currentStatus) => {
    if (currentStatus === 'cancelled') return 'cancelled';
    
    const currentIndex = statusSteps.findIndex(s => s.id === currentStatus);
    const stepIndex = statusSteps.findIndex(s => s.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div style={{ minHeight: '80vh', padding: '4rem 0', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Track Your Order</h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            Have an order ID and email from our team? Check its status below. For WhatsApp orders, message us with your order details for a delivery update.
          </p>
        </div>

        <a href={whatsappUrl('Hi EcommerceWale! I would like a delivery update for my order.')} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginBottom: '2rem' }}><MessageCircle size={18} /> Get a WhatsApp delivery update</a>

        <div style={{ 
          background: 'var(--color-bg-alt)', 
          padding: '2rem', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="grid-2">
              <div className="input-group">
                <label htmlFor="orderId">Order ID</label>
                <input 
                  type="text" 
                  id="orderId" 
                  required 
                  className="input" 
                  placeholder="e.g. EW123456" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required 
                  className="input" 
                  placeholder="john@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.8rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Tracking...' : (
                <>Track Order <Search size={18} /></>
              )}
            </button>
            
            {error && (
              <div style={{ padding: '1rem', background: 'var(--color-error)', color: '#fff', borderRadius: '8px', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </form>
        </div>

        {order && (
          <div className="animate-fadeInUp" style={{ 
            background: 'var(--color-bg-alt)', 
            padding: '2rem', 
            borderRadius: '12px',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Order #{order.id}</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                  Placed on {order.date}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>₹{order.total.toFixed(2)}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{order.items} Items</div>
              </div>
            </div>

            {order.status === 'cancelled' ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-error)' }}>
                <X size={48} style={{ margin: '0 auto 1rem' }} />
                <h3>Order Cancelled</h3>
                <p>This order has been cancelled. Please contact support if you have questions.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '3rem 0 2rem 0' }}>
                {/* Progress Bar Background */}
                <div style={{ 
                  position: 'absolute', 
                  top: '24px', 
                  left: '10%', 
                  right: '10%', 
                  height: '4px', 
                  background: 'var(--color-border)',
                  zIndex: 0 
                }} />
                
                {statusSteps.map((step, i) => {
                  const status = getStepStatus(step.id, order.status);
                  const Icon = step.icon;
                  const isActive = status === 'active' || status === 'completed';
                  
                  return (
                    <div key={step.id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      position: 'relative', 
                      zIndex: 1,
                      width: '25%'
                    }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: isActive ? 'var(--color-primary)' : 'var(--color-bg)',
                        color: isActive ? '#fff' : 'var(--color-text-muted)',
                        border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        marginBottom: '1rem',
                        transition: 'all 0.3s ease'
                      }}>
                        <Icon size={24} />
                      </div>
                      <span style={{ 
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                      }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
