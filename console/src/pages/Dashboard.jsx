import React, { useEffect, useState } from 'react';
import { dispatch, inventory } from '../lib/api';
import { Package, Truck, CheckCircle, Clock, AlertTriangle, Users, Zap, Map } from 'lucide-react';
import LiveMap from '../components/LiveMap';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function SparkBar({ height, today }) {
  return (
    <div style={{
      flex: 1, borderRadius: '2px 2px 0 0',
      background: today ? '#6366f1' : '#6366f155',
      height: `${height}%`, alignSelf: 'flex-end',
    }} />
  );
}

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', dispatched: '#8b5cf6',
  in_transit: '#6366f1', delivered: '#10b981', cancelled: '#ef4444',
};

const DRIVER_STATUS_COLORS = {
  available: '#10b981', on_delivery: '#3b82f6', offline: '#6b7280', on_break: '#f59e0b',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(false);

  useEffect(() => {
    Promise.all([
      dispatch.orders.dashboard().catch(() => ({ data: {} })),
      inventory.products.lowStock().catch(() => ({ data: [] })),
      dispatch.orders.list({ limit: 50 }).catch(() => ({ data: [] })),
      dispatch.drivers.list().catch(() => ({ data: [] })),
      inventory.warehouses.list().catch(() => ({ data: [] })),
    ]).then(([dashRes, lowRes, ordersRes, driversRes, whRes]) => {
      setStats(dashRes.data);
      setLowStock(lowRes.data || []);
      setOrders(ordersRes.data || []);
      setDrivers(driversRes.data || []);
      setWarehouses(whRes.data || []);
      setLoading(false);
    });
  }, []);

  // Refresh driver locations every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch.drivers.list().catch(() => {}).then(res => {
        if (res?.data) setDrivers(res.data);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAutoPlan = async () => {
    try {
      const res = await dispatch.orders.autoPlan();
      alert(`Created ${res.planned} shipments`);
      window.location.reload();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const deliveryRate = stats?.totalOrders
    ? Math.round((stats.delivered / stats.totalOrders) * 100) : 0;

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" onClick={() => setMapView(!mapView)}>
            <Map size={14} /> {mapView ? 'Hide map' : 'Live map'}
          </button>
          <button className="btn btn-accent" onClick={handleAutoPlan}>
            <Zap size={14} /> Auto Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={Clock}         label="Pending"        value={stats?.pending || 0}       color="#f59e0b" />
        <StatCard icon={Truck}         label="In transit"     value={stats?.dispatched || 0}     color="#3b82f6" />
        <StatCard icon={CheckCircle}   label="Delivered"      value={stats?.delivered || 0}      color="#10b981" />
        <StatCard icon={Users}         label="Active drivers" value={stats?.activeDrivers || 0}  color="#8b5cf6" />
        <StatCard icon={AlertTriangle} label="Low stock"      value={lowStock.length}            color="#ef4444" />
        <StatCard icon={Package}       label="Total orders"   value={stats?.totalOrders || 0}    color="#6366f1" />
      </div>

      {/* Live Map */}
      {mapView && (
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-title">
            Live map
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem' }}>
              <span>🏭 Warehouse</span>
              <span>📦 Order</span>
              <span>🚗 Driver</span>
              <span>🔴 Urgent</span>
            </div>
          </div>
          <div style={{ height: 420, borderRadius: 'var(--radius)', overflow: 'hidden', border: '0.5px solid var(--border)' }}>
            <LiveMap orders={activeOrders} drivers={drivers} warehouses={warehouses} />
          </div>
        </div>
      )}

      <div className="dash-grid">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-title">Recent orders</div>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th></tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o._id}>
                  <td><code>{o.orderNumber}</code></td>
                  <td>{o.customerName}</td>
                  <td>
                    <span className="status-badge" style={{ background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!recentOrders.length && <tr><td colSpan="3" className="text-muted">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Weekly chart + delivery rate */}
        <div className="card">
          <div className="card-title">This week</div>
          <div className="sparkline-wrap">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <SparkBar key={i} height={h} today={i === 6} />
            ))}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Delivery rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1, height: 6, background: 'var(--surface-hover)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${deliveryRate}%`, height: '100%', background: '#10b981', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{deliveryRate}%</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {[
              { label: 'Delivered', pct: deliveryRate, color: '#10b981' },
              { label: 'In transit', pct: stats?.dispatched && stats?.totalOrders ? Math.round(stats.dispatched / stats.totalOrders * 100) : 0, color: '#3b82f6' },
              { label: 'Pending', pct: stats?.pending && stats?.totalOrders ? Math.round(stats.pending / stats.totalOrders * 100) : 0, color: '#f59e0b' },
            ].map(({ label, pct, color }) => (
              <div key={label} className="bar-row">
                <span className="bar-label">{label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="bar-val">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Driver status */}
        <div className="card">
          <div className="card-title">
            Driver status
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Live</span>
          </div>
          <div className="driver-grid">
            {drivers.map(d => (
              <div key={d._id} className="driver-chip">
                <div className="driver-avatar">{d.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>{d.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.65rem', color: DRIVER_STATUS_COLORS[d.status] || '#6b7280' }}>
                    {d.status.replace('_', ' ')}
                  </div>
                </div>
                <div className="driver-dot" style={{ background: DRIVER_STATUS_COLORS[d.status] || '#6b7280' }} />
              </div>
            ))}
            {!drivers.length && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No drivers yet</p>}
          </div>
        </div>

        {/* Low stock */}
        <div className="card">
          <div className="card-title">Low stock alerts</div>
          {lowStock.length === 0
            ? <p style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ All stock levels healthy</p>
            : (
              <table className="data-table">
                <thead><tr><th>SKU</th><th>Product</th><th>Available</th><th>Min</th></tr></thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id}>
                      <td><code>{p.sku}</code></td>
                      <td>{p.name}</td>
                      <td className="text-danger">{p.total_available}</td>
                      <td>{p.min_stock_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
    </div>
  );
}
