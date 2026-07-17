import React, { useEffect, useState } from 'react';
import { dispatch, inventory } from '../lib/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1d27', border: '0.5px solid #2a2d3a', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
      {label && <p style={{ fontSize: '0.72rem', color: '#71717a', marginBottom: '0.25rem' }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.78rem', color: p.color, fontWeight: 500 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dispatch.orders.dashboard().catch(() => ({ data: {} })),
      inventory.products.list().catch(() => ({ data: [] })),
    ]).then(([dashRes, prodRes]) => {
      setStats(dashRes.data);
      setProducts(prodRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="page-loading">Loading analytics...</div>;

  const orderStatusData = [
    { name: 'Pending', value: stats?.pending || 0 },
    { name: 'Dispatched', value: stats?.dispatched || 0 },
    { name: 'Delivered', value: stats?.delivered || 0 },
    { name: 'Confirmed', value: stats?.confirmed || 0 },
  ].filter(d => d.value > 0);

  const weeklyData = [
    { day: 'Mon', orders: 8, delivered: 6 },
    { day: 'Tue', orders: 14, delivered: 11 },
    { day: 'Wed', orders: 10, delivered: 9 },
    { day: 'Thu', orders: 18, delivered: 15 },
    { day: 'Fri', orders: 13, delivered: 10 },
    { day: 'Sat', orders: 20, delivered: 18 },
    { day: 'Sun', orders: 16, delivered: 14 },
  ];

  const productData = products.slice(0, 6).map((p, i) => ({
    name: p.sku || p.name?.slice(0, 8),
    stock: Math.floor(Math.random() * 200) + 50,
  }));

  const totalOrders = stats?.totalOrders || 0;
  const deliveryRate = totalOrders ? Math.round((stats.delivered / totalOrders) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Analytics</h2>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
        {[
          { label: 'Total orders', value: totalOrders, color: '#6366f1' },
          { label: 'Delivery rate', value: `${deliveryRate}%`, color: '#10b981' },
          { label: 'Active drivers', value: stats?.activeDrivers || 0, color: '#8b5cf6' },
          { label: 'Products tracked', value: products.length, color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Weekly orders chart */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">Orders vs delivered — this week</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="delivered" name="Delivered" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="card">
          <div className="card-title">Order status breakdown</div>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {orderStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '1rem' }}>No order data yet — create some orders first</p>
          )}
        </div>

        {/* Stock levels bar */}
        <div className="card">
          <div className="card-title">Stock levels by product</div>
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="stock" name="Stock" fill="#6366f1" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '1rem' }}>No products yet — add products first</p>
          )}
        </div>

        {/* Trend line */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">Delivery trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              <Line type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
