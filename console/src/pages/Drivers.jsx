import React, { useEffect, useState } from 'react';
import { dispatch } from '../lib/api';
import { Plus } from 'lucide-react';

const STATUS_COLORS = { available: '#10b981', on_delivery: '#3b82f6', offline: '#6b7280', on_break: '#f59e0b' };

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', vehicleType: 'van', vehicleNumber: '' });

  const load = () => {
    dispatch.drivers.list().then(res => { setDrivers(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch.drivers.create(form);
      setShowForm(false);
      setForm({ name: '', phone: '', vehicleType: 'van', vehicleNumber: '' });
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Drivers</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Driver</button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleCreate}>
          <div className="form-grid">
            <input placeholder="Driver Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
              <option value="bike">Bike</option><option value="van">Van</option><option value="truck">Truck</option>
            </select>
            <input placeholder="Vehicle Number" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      )}

      <div className="card">
        {loading ? <p>Loading...</p> : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Vehicle</th><th>Status</th><th>Rating</th><th>Deliveries</th></tr></thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d._id}>
                  <td>{d.name}</td><td>{d.phone}</td><td>{d.vehicleType} — {d.vehicleNumber || '—'}</td>
                  <td><span className="status-badge" style={{ background: `${STATUS_COLORS[d.status]}20`, color: STATUS_COLORS[d.status] }}>{d.status}</span></td>
                  <td>⭐ {d.rating?.toFixed(1)}</td><td>{d.totalDeliveries}</td>
                </tr>
              ))}
              {!drivers.length && <tr><td colSpan="6" className="text-muted">No drivers yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
