import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, Users, Warehouse,
  RotateCcw, BarChart2, Settings, LogOut, Zap
} from 'lucide-react';
import Dashboard  from './pages/Dashboard';
import Inventory  from './pages/Inventory';
import Dispatch   from './pages/Dispatch';
import Drivers    from './pages/Drivers';
import Warehouses from './pages/Warehouses';
import Returns    from './pages/Returns';
import Analytics  from './pages/Analytics';
import SettingsPage from './pages/Settings';
import Login      from './pages/Login';

const NAV = [
  { section: 'Operations' },
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dispatch',   icon: Truck,           label: 'Dispatch'  },
  { to: '/drivers',    icon: Users,           label: 'Drivers'   },
  { section: 'Inventory' },
  { to: '/inventory',  icon: Package,         label: 'Products'  },
  { to: '/warehouses', icon: Warehouse,       label: 'Warehouses'},
  { to: '/returns',    icon: RotateCcw,       label: 'Returns'   },
  { section: 'Insights' },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
  { to: '/settings',   icon: Settings,        label: 'Settings'  },
];

function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-wrap">
          <div className="logo-mark">P</div>
          <div>
            <div className="logo">Prodis</div>
            <div className="logo-sub">Product & Dispatch</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section-label">{item.section}</div>
          ) : (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <item.icon size={15} />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <span className="user-email">{user?.email}</span>
          <div className="user-tenant">⬡ {user?.tenant_id}</div>
        </div>
        <button className="btn logout-btn" onClick={onLogout}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export default function App() {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('prodis_session') || 'null');
    if (s?.access_token && s?.tenant_id) setUser(s);
    setLoading(false);
  }, []);

  if (loading) return <div className="page-loading">Loading Prodis...</div>;
  if (!user)   return <Login onLogin={u => setUser(u)} />;

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={() => { localStorage.removeItem('prodis_session'); setUser(null); }} />
      <main className="main-content">
        <Routes>
          <Route path="/"           element={<Navigate to="/dashboard" />} />
          <Route path="/login"      element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard"  element={<Dashboard />}  />
          <Route path="/inventory"  element={<Inventory />}  />
          <Route path="/dispatch"   element={<Dispatch />}   />
          <Route path="/drivers"    element={<Drivers />}    />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/returns"    element={<Returns />}    />
          <Route path="/analytics"  element={<Analytics />}  />
          <Route path="/settings"   element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
