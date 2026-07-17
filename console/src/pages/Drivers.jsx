import React, { useEffect, useState, useRef } from 'react';
import { dispatch } from '../lib/api';
import { Plus, Zap, Search, Upload, QrCode, ExternalLink, Filter } from 'lucide-react';

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', dispatched: '#8b5cf6',
  in_transit: '#6366f1', delivered: '#10b981', cancelled: '#ef4444', returned: '#f97316',
};

export default function Dispatch() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planning, setPlanning] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();

  const load = () => {
    dispatch.orders.list({ limit: 200 }).then(res => {
      const data = res.data || [];
      setOrders(data);
      setFiltered(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.customerName?.toLowerCase().includes(q) ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const handleAutoPlan = async () => {
    setPlanning(true);
    try {
      const res = await dispatch.orders.autoPlan();
      alert(`Created ${res.planned} shipments`);
      load();
    } catch (err) { alert(err.message); }
    setPlanning(false);
  };

  // Bulk CSV import
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvData(ev.target.result);
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData) return alert('Upload a CSV file first');
    setImporting(true);
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1);

      let created = 0;
      for (const row of rows) {
        const cols = row.split(',').map(c => c.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((h, i) => obj[h] = cols[i]);

        await dispatch.orders.create({
          items: [{ productId: obj.product_id || 'unknown', sku: obj.sku || '', name: obj.product_name || 'Product', quantity: parseInt(obj.quantity) || 1 }],
          shippingAddress: { line1: obj.address || '', city: obj.city || '', state: obj.state || '', postalCode: obj.pincode || '' },
          customerName: obj.customer_name || 'Unknown',
          customerPhone: obj.phone || '',
          priority: obj.priority || 'normal',
        });
        created++;
      }
      alert(`Imported ${created} orders`);
      setShowImport(false);
      setCsvData('');
      load();
    } catch (err) { alert('Import failed: ' + err.message); }
    setImporting(false);
  };

  const getTrackingUrl = (orderId) => `${window.location.origin}/track/${orderId}`;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Dispatch</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" onClick={() => setShowImport(!showImport)}><Upload size={14} /> Import CSV</button>
          <button className="btn btn-accent" onClick={handleAutoPlan} disabled={planning}>
            <Zap size={14} /> {planning ? 'Planning...' : 'Auto Plan'}
          </button>
        </div>
      </div>

      {/* CSV Import panel */}
      {showImport && (
        <div className="card form-card">
          <div className="card-title">Bulk import orders via CSV</div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            CSV headers: <code>customer_name, phone, address, city, state, pincode, sku, product_name, quantity, priority</code>
          </p>
          <input type="file" accept=".csv" ref={fileRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={() => fileRef.current.click()}><Upload size={14} /> Choose CSV file</button>
            {csvData && <span style={{ fontSize: '0.78rem', color: '#10b981', alignSelf: 'center' }}>✓ File loaded</span>}
            <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import orders'}
            </button>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search by customer, order number, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="dispatched">Dispatched</option>
          <option value="in_transit">In transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} orders</span>
      </div>

      <div className="card">
        {loading ? <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>City</th><th>Items</th>
                <th>Status</th><th>Priority</th><th>Track</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o._id}>
                  <td><code>{o.orderNumber}</code></td>
                  <td>{o.customerName}</td>
                  <td>{o.shippingAddress?.city || '—'}</td>
                  <td>{o.items?.length || 0}</td>
                  <td><span className="status-badge" style={{ background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                  <td><span className="status-badge" style={{ background: o.priority === 'urgent' ? '#ef444420' : '#6366f120', color: o.priority === 'urgent' ? '#ef4444' : '#6366f1' }}>{o.priority}</span></td>
                  <td>
                    <a href={getTrackingUrl(o._id)} target="_blank" rel="noreferrer" style={{ color: '#6366f1', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ExternalLink size={12} /> Track
                    </a>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="8" className="text-muted">No orders found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
