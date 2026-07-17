import React, { useEffect, useState } from 'react';
import { dispatch, inventory } from '../lib/api';
import { Package, Truck, AlertTriangle, Users, CheckCircle, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = '#6366f1' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={22} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dispatch.orders.dashboard().catch(() => ({ data: {} })),
      inventory.products.lowStock().catch(() => ({ data: [] })),
    ]).then(([dashRes, lowRes]) => {
      setStats(dashRes.data);
      setLowStock(lowRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>

      <div className="stats-grid">
        <StatCard icon={Clock} label="Pending Orders" value={stats?.pending || 0} color="#f59e0b" />
        <StatCard icon={Truck} label="Dispatched" value={stats?.dispatched || 0} color="#3b82f6" />
        <StatCard icon={CheckCircle} label="Delivered" value={stats?.delivered || 0} color="#10b981" />
        <StatCard icon={Users} label="Active Drivers" value={stats?.activeDrivers || 0} color="#8b5cf6" />
        <StatCard icon={Package} label="Total Orders" value={stats?.totalOrders || 0} color="#6366f1" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={lowStock.length} color="#ef4444" />
      </div>

      {lowStock.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 className="card-title">Low Stock Alerts</h3>
          <table className="data-table">
            <thead>
              <tr><th>SKU</th><th>Product</th><th>Available</th><th>Min Level</th></tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td><code>{p.sku}</code></td>
                  <td>{p.name}</td>
                  <td className="text-danger">{p.total_available}</td>
                  <td>{p.min_stock_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
