import React, { useEffect, useState } from 'react';
import { dispatch, inventory } from '../lib/api';
import { Package, Truck, CheckCircle, Clock, AlertTriangle, Users, Zap, Map, TrendingUp } from 'lucide-react';
import LiveMap from '../components/LiveMap';

const STATUS_COLORS = {
  pending:   { bg: 'var(--amber-dim)',  text: 'var(--amber)'  },
  confirmed: { bg: 'var(--blue-dim)',   text: 'var(--blue)'   },
  dispatched:{ bg: 'var(--purple-dim)', text: 'var(--purple)' },
  in_transit:{ bg: 'var(--indigo-glow)',text: 'var(--indigo-2)'},
  delivered: { bg: 'var(--green-dim)',  text: 'var(--green)'  },
  cancelled: { bg: 'var(--red-dim)',    text: 'var(--red)'    },
};

const DRIVER_COLORS = {
  available:  'var(--green)',
  on_delivery:'var(--blue)',
  offline:    'var(--text-3)',
  on_break:   'var(--amber)',
};

function StatCard({ icon: Icon, label, value, color, delta }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {delta && <div className="stat-delta" style={{ color: delta > 0 ? 'var(--green)' : 'var(--red)' }}>
          {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}% vs yesterday
        </div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [lowStock, setLowStock]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [drivers, setDrivers]     = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [mapOpen, setMapOpen]     = useState(false);

  useEffect(() => {
    Promise.all([
      dispatch.orders.dashboard().catch(() => ({ data: {} })),
      inventory.products.lowStock().catch(() => ({ data: [] })),
      dispatch.orders.list({ limit: 8 }).catch(() => ({ data: [] })),
      dispatch.drivers.list().catch(() => ({ data: [] })),
      inventory.warehouses.list().catch(() => ({ data: [] })),
    ]).then(([d, l, o, dr, w]) => {
      setStats(d.data); setLowStock(l.data || []);
      setOrders(o.data || []); setDrivers(dr.data || []);
      setWarehouses(w.data || []); setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const deliveryRate = stats?.totalOrders ? Math.round((stats.delivered / stats.totalOrders) * 100) : 0;
  const activeOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Operations</h2>
          <p className="page-subtitle">Live overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" onClick={() => setMapOpen(m => !m)}>
            <Map size={14} /> {mapOpen ? 'Hide map' : 'Live map'}
          </button>
          <button className="btn btn-primary" onClick={async () => {
            try { const r = await dispatch.orders.autoPlan(); alert(`✓ Created ${r.planned} shipments`); window.location.reload(); }
            catch(e) { alert(e.message); }
          }}>
            <Zap size={14} /> Auto Plan
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="stats-grid">
        <StatCard icon={Clock}         label="Pending"        value={stats?.pending || 0}      color="var(--amber)"   delta={12}  />
        <StatCard icon={Truck}         label="In Transit"     value={stats?.dispatched || 0}   color="var(--blue)"    delta={-3}  />
        <StatCard icon={CheckCircle}   label="Delivered"      value={stats?.delivered || 0}    color="var(--green)"   delta={8}   />
        <StatCard icon={Users}         label="Active Drivers" value={stats?.activeDrivers || 0}color="var(--purple)"              />
        <StatCard icon={AlertTriangle} label="Low Stock"      value={lowStock.length}          color="var(--red)"                 />
        <StatCard icon={TrendingUp}    label="Delivery Rate"  value={`${deliveryRate}%`}       color="var(--cyan)"                />
      </div>

      {/* Live map */}
      {mapOpen && (
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-header">
            <div className="card-title">
              <span style={{ color: 'var(--green)', fontSize: '0.6rem' }}>●</span> Live Fleet Map
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.68rem', color: 'var(--text-3)' }}>
              <span>🏭 Warehouse</span><span>📦 Order</span><span>🚗 Driver</span>
            </div>
          </div>
          <div style={{ height: 380, borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <LiveMap orders={activeOrders} drivers={drivers} warehouses={warehouses} />
          </div>
        </div>
      )}

      <div className="dash-grid">
        {/* Recent orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Truck size={14} /> Recent Orders</div>
            <a href="/dispatch" style={{ fontSize: '0.72rem', color: 'var(--indigo-2)', textDecoration: 'none' }}>View all →</a>
          </div>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map(o => {
                const c = STATUS_COLORS[o.status] || { bg: '#ffffff10', text: '#fff' };
                return (
                  <tr key={o._id}>
                    <td><code>{o.orderNumber?.slice(-8)}</code></td>
                    <td style={{ color: 'var(--text)' }}>{o.customerName}</td>
                    <td><span className="badge" style={{ background: c.bg, color: c.text }}>{o.status}</span></td>
                  </tr>
                );
              })}
              {!orders.length && <tr><td colSpan="3" className="text-muted">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Delivery performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><TrendingUp size={14} /> Performance</div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>This week</span>
          </div>

          {/* Mini sparkline */}
          <div className="sparkline-wrap" style={{ marginBottom: '1rem' }}>
            {[35, 58, 42, 76, 51, 88, 65].map((h, i) => (
              <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', background: i === 6 ? 'var(--indigo)' : 'var(--indigo-glow)', height: `${h}%`, alignSelf: 'flex-end', border: i === 6 ? '1px solid var(--indigo)' : '1px solid rgba(100,112,243,0.2)' }} />
            ))}
          </div>

          {/* Delivery rate */}
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Delivery rate</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: 'var(--green)', fontWeight: 600 }}>{deliveryRate}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ width: `${deliveryRate}%`, height: '100%', background: 'var(--green)', borderRadius: 2, transition: 'width 1s ease' }} />
          </div>

          {[
            { label: 'Delivered',   pct: deliveryRate,                                                                                         color: 'var(--green)'  },
            { label: 'In transit',  pct: stats?.totalOrders ? Math.round(stats.dispatched/stats.totalOrders*100) : 0,                         color: 'var(--blue)'   },
            { label: 'Pending',     pct: stats?.totalOrders ? Math.round(stats.pending/stats.totalOrders*100) : 0,                             color: 'var(--amber)'  },
          ].map(({ label, pct, color }) => (
            <div key={label} className="bar-row">
              <span className="bar-label">{label}</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: color }} /></div>
              <span className="bar-val">{pct}%</span>
            </div>
          ))}
        </div>

        {/* Driver status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span style={{ color: 'var(--green)', fontSize: '0.6rem' }}>●</span> Driver Status
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>{drivers.filter(d=>d.status==='on_delivery').length} on route</span>
          </div>
          <div className="driver-grid">
            {drivers.map(d => (
              <div key={d._id} className="driver-chip">
                <div className="driver-avatar">{d.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.62rem', color: DRIVER_COLORS[d.status] }}>{d.status.replace('_',' ')}</div>
                </div>
                <div className="driver-dot" style={{ background: DRIVER_COLORS[d.status] }} />
              </div>
            ))}
            {!drivers.length && <p className="text-muted">No drivers added yet</p>}
          </div>
        </div>

        {/* Low stock */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><AlertTriangle size={14} color="var(--amber)" /> Stock Alerts</div>
            <span style={{ fontSize: '0.68rem', background: 'var(--red-dim)', color: 'var(--red)', padding: '0.1rem 0.45rem', borderRadius: 20 }}>{lowStock.length} alerts</span>
          </div>
          {lowStock.length === 0
            ? <p style={{ fontSize: '0.8rem', color: 'var(--green)', display: 'flex', gap: '0.4rem' }}>✓ All stock levels healthy</p>
            : (
              <table className="data-table">
                <thead><tr><th>SKU</th><th>Product</th><th>Available</th></tr></thead>
                <tbody>
                  {lowStock.slice(0,5).map(p => (
                    <tr key={p.id}>
                      <td><code>{p.sku}</code></td>
                      <td style={{ color: 'var(--text)' }}>{p.name}</td>
                      <td><span style={{ color: 'var(--red)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>{p.total_available}</span></td>
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
