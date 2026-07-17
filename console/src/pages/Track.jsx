import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const DISPATCH_URL = import.meta.env.VITE_DISPATCH_URL || 'http://localhost:3002';

const STATUS_STEPS = ['pending', 'confirmed', 'dispatched', 'in_transit', 'delivered'];
const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', dispatched: '#8b5cf6',
  in_transit: '#6366f1', delivered: '#10b981', cancelled: '#ef4444',
};

export default function Track() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${DISPATCH_URL}/api/orders/${orderId}/public`)
      .then(r => r.json())
      .then(res => { setOrder(res.data); setLoading(false); })
      .catch(() => { setError('Order not found'); setLoading(false); });
  }, [orderId]);

  const stepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: '#e4e4e7', fontFamily: 'Inter, sans-serif' }}>
      Loading...
    </div>
  );

  if (error || !order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: '#e4e4e7', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
        <p style={{ color: '#71717a' }}>Order not found or tracking unavailable</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e4e4e7', fontFamily: 'Inter, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6366f1', marginBottom: '0.25rem' }}>⬡ Prodis</div>
          <p style={{ color: '#71717a', fontSize: '0.85rem' }}>Order Tracking</p>
        </div>

        {/* Order card */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '0.25rem' }}>ORDER NUMBER</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{order.orderNumber}</div>
            </div>
            <span style={{ background: `${STATUS_COLORS[order.status]}20`, color: STATUS_COLORS[order.status], padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>
              {order.status?.replace('_', ' ')}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
            <div>Customer: <span style={{ color: '#e4e4e7' }}>{order.customerName}</span></div>
            <div style={{ marginTop: '0.25rem' }}>Delivering to: <span style={{ color: '#e4e4e7' }}>{order.shippingAddress?.line1}, {order.shippingAddress?.city}</span></div>
            {order.estimatedDelivery && (
              <div style={{ marginTop: '0.25rem' }}>Est. delivery: <span style={{ color: '#10b981' }}>{new Date(order.estimatedDelivery).toLocaleDateString()}</span></div>
            )}
          </div>
        </div>

        {/* Progress steps */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem' }}>Delivery progress</div>
          {STATUS_STEPS.map((step, i) => {
            const done = i <= stepIndex;
            const current = i === stepIndex;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: i < STATUS_STEPS.length - 1 ? '0' : '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#6366f1' : '#2a2d3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: done ? '#fff' : '#71717a', border: current ? '2px solid #6366f1' : 'none', flexShrink: 0 }}>
                    {done && !current ? '✓' : i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ width: 2, height: 24, background: done ? '#6366f1' : '#2a2d3a', margin: '2px 0' }} />
                  )}
                </div>
                <div style={{ paddingTop: '0.25rem', paddingBottom: i < STATUS_STEPS.length - 1 ? '0.5rem' : 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: current ? 600 : 400, color: done ? '#e4e4e7' : '#71717a', textTransform: 'capitalize' }}>
                    {step.replace('_', ' ')}
                  </div>
                  {current && <div style={{ fontSize: '0.7rem', color: '#6366f1', marginTop: '0.1rem' }}>Current status</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Items */}
        <div style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>Items in this order</div>
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < order.items.length - 1 ? '0.5px solid #2a2d3a' : 'none', fontSize: '0.8rem' }}>
              <span>{item.name || item.sku}</span>
              <span style={{ color: '#71717a' }}>× {item.quantity}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#71717a', marginTop: '2rem' }}>
          Powered by Prodis · Product & Dispatch Platform
        </p>
      </div>
    </div>
  );
}
