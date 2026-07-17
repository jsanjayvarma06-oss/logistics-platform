import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  Package, Truck, LayoutDashboard, Warehouse, Users,
  Settings, BarChart2, LogOut, RotateCcw, Search
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Dispatch from './pages/Dispatch';
import Drivers from './pages/Drivers';
import Warehouses from './pages/Warehouses';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/Settings';
import Returns from './pages/Returns';
import Login from './pages/Login';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory',  icon: Package,          label: 'Inventory' },
  { to: '/dispatch',   icon: Truck,            label: 'Dispatch' },
  { to: '/drivers',    icon: Users,            label: 'Drivers' },
  { to: '/warehouses', icon: Warehouse,        label: 'Warehouses' },
  { to: '/returns',    icon: RotateCcw,        label: 'Returns' },
  { to: '/analytics',  icon: BarChart2,        label: 'Analytics' },
  { to: '/settings',   icon: Settings,         label: 'Settings' },
];

function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-wrap">
          <span className="logo-icon">⬡</span>
          <div>
            <h1 className="logo">Prodis</h1>
            <span className="logo-sub">Product & Dispatch</span>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-email">{user?.email}</span>
          <span className="user-tenant">{user?.tenant_id}</span>
        </div>
        <button className="btn logout-btn" onClick={onLogout}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('prodis_session') || 'null');
    if (session?.access_token && session?.tenant_id) setUser(session);
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => { localStorage.removeItem('prodis_session'); setUser(null); };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/"           element={<Navigate to="/dashboard" />} />
          <Route path="/login"      element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/inventory"  element={<Inventory />} />
          <Route path="/dispatch"   element={<Dispatch />} />
          <Route path="/drivers"    element={<Drivers />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/returns"    element={<Returns />} />
          <Route path="/analytics"  element={<Analytics />} />
          <Route path="/settings"   element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
