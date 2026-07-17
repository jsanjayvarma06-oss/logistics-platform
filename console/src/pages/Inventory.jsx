import React, { useEffect, useState } from 'react';
import { inventory } from '../lib/api';
import { Plus, Search } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', category: '', unit: 'piece', min_stock_level: 10 });

  const load = () => {
    inventory.products.list().then(res => { setProducts(res.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await inventory.products.create(form);
      setShowForm(false);
      setForm({ sku: '', name: '', category: '', unit: 'piece', min_stock_level: 10 });
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Inventory</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleCreate}>
          <div className="form-grid">
            <input placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              <option value="piece">Piece</option><option value="kg">Kg</option><option value="litre">Litre</option><option value="box">Box</option>
            </select>
            <input type="number" placeholder="Min Stock Level" value={form.min_stock_level} onChange={e => setForm({ ...form, min_stock_level: +e.target.value })} />
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
            <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Unit</th><th>Min Stock</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}><td><code>{p.sku}</code></td><td>{p.name}</td><td>{p.category || '—'}</td><td>{p.unit}</td><td>{p.min_stock_level}</td></tr>
              ))}
              {!products.length && <tr><td colSpan="5" className="text-muted">No products yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
