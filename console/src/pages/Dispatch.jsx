import React, { useEffect, useState } from 'react';
import { dispatch } from '../lib/api';
import { Plus, Zap } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', dispatched: '#8b5cf6',
  in_transit: '#6366f1', delivered: '#10b981', cancelled: '#ef4444',
};

export default function Dispatch() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);

  const load = () => {
    dispatch.orders.list().then(res => { setOrders(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAutoPlan = async () => {
    setPlanning(true);
    try {
      const res = await dispatch.orders.autoPlan();
      alert(`Created ${res.planned} shipments`);
      load();
    } catch (err) { alert(err.message); }
    setPlanning(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Dispatch</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-accent" onClick={handleAutoPlan} disabled={planning}>
            <Zap size={16} /> {planning ? 'Planning...' : 'Auto Plan'}
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> : (
          <table className="data-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Status</th><th>Priority</th><th>Created</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><code>{o.orderNumber}</code></td>
                  <td>{o.customerName}</td>
                  <td>{o.items?.length || 0}</td>
                  <td><span className="status-badge" style={{ background: `${STATUS_COLORS[o.status] || '#666'}20`, color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                  <td>{o.priority}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!orders.length && <tr><td colSpan="6" className="text-muted">No orders yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
