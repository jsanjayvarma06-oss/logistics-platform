import React, { useEffect, useState } from 'react';
import { dispatch, inventory } from '../lib/api';
import { Plus, RotateCcw } from 'lucide-react';

const REASON_OPTIONS = ['Damaged', 'Wrong item', 'Not as described', 'Customer changed mind', 'Defective', 'Other'];

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ orderId: '', reason: 'Damaged', notes: '', restockItems: true });

  useEffect(() => {
    Promise.all([
      dispatch.orders.list({ status: 'delivered', limit: 100 }).catch(() => ({ data: [] })),
      dispatch.returns?.list().catch(() => ({ data: [] })),
    ]).then(([ordersRes, returnsRes]) => {
      setOrders(ordersRes.data || []);
      setReturns(returnsRes?.data || []);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch.orders.updateStatus(form.orderId, 'returned');
      const order = orders.find(o => o._id === form.orderId);
      if (form.restockItems && order?.items) {
        // publish restock event via returns
        setReturns(prev => [...prev, {
          _id: Date.now(),
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          reason: form.reason,
          notes: form.notes,
          restocked: form.restockItems,
          createdAt: new Date().toISOString(),
          status: 'processed',
        }]);
      }
      alert(`Return processed for order ${order?.orderNumber}`);
      setShowForm(false);
      setForm({ orderId: '', reason: 'Damaged', notes: '', restockItems: true });
      // Refresh orders
      dispatch.orders.list({ status: 'delivered', limit: 100 }).then(r => setOrders(r.data || []));
    } catch (err) { alert(err.message); }
    setSubmitting(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Returns</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={14} /> New return
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <div className="card-title">Process a return</div>
          <div className="form-grid">
            <select value={form.orderId} onChange={e => setForm({ ...form, orderId: e.target.value })} required>
              <option value="">Select delivered order...</option>
              {orders.filter(o => o.status === 'delivered').map(o => (
                <option key={o._id} value={o._id}>{o.orderNumber} — {o.customerName}</option>
              ))}
            </select>
            <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}>
              {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input placeholder="Additional notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input type="checkbox" id="restock" checked={form.restockItems} onChange={e => setForm({ ...form, restockItems: e.target.checked })} style={{ width: 'auto' }} />
            <label htmlFor="restock" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Auto-restock items to inventory
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <RotateCcw size={14} /> {submitting ? 'Processing...' : 'Process return'}
            </button>
          </div>
        </form>
      )}

      <div className="card">
        {loading ? <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>Loading...</p> : (
          <>
            <div className="card-title">
              Return history
              <span className="status-badge" style={{ background: '#f9730020', color: '#f97316' }}>{returns.length} returns</span>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Reason</th><th>Restocked</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {returns.map(r => (
                  <tr key={r._id}>
                    <td><code>{r.orderNumber}</code></td>
                    <td>{r.customerName}</td>
                    <td>{r.reason}</td>
                    <td>{r.restocked ? <span style={{ color: '#10b981' }}>✓ Yes</span> : <span style={{ color: '#71717a' }}>No</span>}</td>
                    <td><span className="status-badge" style={{ background: '#10b98120', color: '#10b981' }}>{r.status || 'processed'}</span></td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!returns.length && <tr><td colSpan="6" className="text-muted">No returns yet</td></tr>}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
