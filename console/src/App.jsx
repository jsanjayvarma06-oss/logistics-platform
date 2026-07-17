import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  Package, Truck, LayoutDashboard, Warehouse, Users, Settings, LogOut,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Dispatch from './pages/Dispatch';
import Drivers from './pages/Drivers';
import Warehouses from './pages/Warehouses';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/dispatch', icon: Truck, label: 'Dispatch' },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { to: '/warehouses', icon: Warehouse, label: 'Warehouses' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">◆ Argcord</h1>
        <span className="logo-sub">Logistics Console</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-link">
          <Settings size={18} /> <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/warehouses" element={<Warehouses />} />
        </Routes>
      </main>
    </div>
  );
}
