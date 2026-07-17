import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jwqahlyybmhqpurovnnd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWFobHl5Ym1ocXB1cm92bm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjQ0ODMsImV4cCI6MjA5OTg0MDQ4M30.J6cqGhAJQma5Zccq0ZTl94-1obR_qsw7MF148MBS5Eo'
);

const FEATURES = [
  { icon: '⬡', title: 'Real-time fleet tracking', desc: 'Live driver locations and order status across all warehouses' },
  { icon: '◈', title: 'Route optimization', desc: 'Nearest-neighbor routing to minimize delivery time and fuel cost' },
  { icon: '◉', title: 'Multi-tenant ready', desc: 'Isolated data per client — onboard in under 2 minutes' },
  { icon: '◆', title: 'Inventory intelligence', desc: 'Low-stock alerts, FIFO batch tracking, and return management' },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) { setError(error.message); setLoading(false); return; }

    const tenantId =
      data.user.user_metadata?.tenant_id ||
      data.user.raw_user_meta_data?.tenant_id ||
      data.user.app_metadata?.tenant_id;

    if (!tenantId) { setError('No tenant assigned to this account. Contact your administrator.'); setLoading(false); return; }

    localStorage.setItem('prodis_session', JSON.stringify({
      access_token: data.session.access_token,
      tenant_id: tenantId,
      email: data.user.email,
    }));

    onLogin({ tenant_id: tenantId, email: data.user.email });
  };

  return (
    <div className="login-page">
      {/* Left panel — brand + features */}
      <div className="login-left">
        <div style={{ maxWidth: 480 }}>
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(100,112,243,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(180,124,248,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6470f3, #b47cf8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', boxShadow: '0 0 24px rgba(100,112,243,0.3)', fontFamily: "'Space Grotesk', sans-serif" }}>P</div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#eef0f8', letterSpacing: '-0.02em' }}>Prodis</div>
                <div style={{ fontSize: '0.65rem', color: '#5c6488', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Product & Dispatch Platform</div>
              </div>
            </div>

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.4rem', fontWeight: 700, color: '#eef0f8', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Logistics built for<br />
              <span style={{ background: 'linear-gradient(135deg, #6470f3, #b47cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>speed & scale</span>
            </h1>

            <p style={{ fontSize: '0.9rem', color: '#a8aec8', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 380 }}>
              Real-time fleet tracking, intelligent route planning, and multi-warehouse inventory — all in one platform.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.75rem 1rem', background: '#111422', border: '1px solid #1f2440', borderRadius: 10 }}>
                  <span style={{ fontSize: '1.1rem', color: '#6470f3', flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#eef0f8', marginBottom: '0.1rem' }}>{f.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#5c6488' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #1f2440', display: 'flex', gap: '2rem' }}>
              {[['99.9%', 'Uptime SLA'], ['< 30ms', 'API response'], ['∞', 'Tenants']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#6470f3' }}>{v}</div>
                  <div style={{ fontSize: '0.65rem', color: '#5c6488', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="login-right">
        <div className="login-box">
          <div className="login-brand">
            <div className="login-logo-mark">P</div>
            <span className="login-logo-text">Prodis</span>
          </div>
          <p className="login-tagline">Sign in to your workspace</p>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label>Email address</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="login-error">⚠ {error}</div>}
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ fontSize: '0.7rem', color: '#5c6488', textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.6 }}>
            Don't have an account? Contact your workspace admin.<br />
            Powered by <span style={{ color: '#6470f3' }}>Prodis</span> · Secure & encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
