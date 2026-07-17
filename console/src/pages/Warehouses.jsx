import React, { useEffect, useState } from 'react';
import { inventory } from '../lib/api';
import { Plus, MapPin } from 'lucide-react';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', city: '', state: '', capacity: 1000 });

  const load = () => {
    inventory.warehouses.list().then(res => { setWarehouses(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await inventory.warehouses.create(form);
      setShowForm(false);
      setForm({ name: '', code: '', city: '', state: '', capacity: 1000 });
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Warehouses</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add Warehouse</button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleCreate}>
          <div className="form-grid">
            <input placeholder="Warehouse Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Code (e.g. WH-HYD-01)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
            <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
            <input type="number" placeholder="Capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} />
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
            <thead><tr><th>Code</th><th>Name</th><th>Location</th><th>Capacity</th><th>Status</th></tr></thead>
            <tbody>
              {warehouses.map(w => (
                <tr key={w.id}>
                  <td><code>{w.code}</code></td><td>{w.name}</td>
                  <td><MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {w.city || '—'}, {w.state || '—'}</td>
                  <td>{w.capacity?.toLocaleString()}</td>
                  <td><span className="status-badge" style={{ background: w.is_active ? '#10b98120' : '#ef444420', color: w.is_active ? '#10b981' : '#ef4444' }}>{w.is_active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
              {!warehouses.length && <tr><td colSpan="5" className="text-muted">No warehouses yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
