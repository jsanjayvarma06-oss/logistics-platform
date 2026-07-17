import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jwqahlyybmhqpurovnnd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWFobHl5Ym1ocXB1cm92bm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjQ0ODMsImV4cCI6MjA5OTg0MDQ4M30.J6cqGhAJQma5Zccq0ZTl94-1obR_qsw7MF148MBS5Eo'
);

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

    if (!tenantId) { setError('No tenant assigned. Contact support.'); setLoading(false); return; }

    localStorage.setItem('prodis_session', JSON.stringify({
      access_token: data.session.access_token,
      tenant_id: tenantId,
      email: data.user.email,
    }));

    onLogin({ tenant_id: tenantId, email: data.user.email });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-brand">
          <span className="login-logo-icon">⬡</span>
          <h1 className="login-logo-text">Prodis</h1>
        </div>
        <p className="login-sub">Product & Dispatch Platform</p>
        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label>Email</label>
            <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
