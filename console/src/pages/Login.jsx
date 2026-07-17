import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
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

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const tenantId = data.user.user_metadata?.tenant_id;
    if (!tenantId) {
      setError('No tenant assigned to this account. Contact support.');
      setLoading(false);
      return;
    }

    // Save session
    localStorage.setItem('logistics_session', JSON.stringify({
      access_token: data.session.access_token,
      tenant_id: tenantId,
      email: data.user.email,
    }));

    onLogin({ tenant_id: tenantId, email: data.user.email });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="logo">◆ Argcord</h1>
        <p className="login-sub">Logistics Console</p>

        <form onSubmit={handleLogin}>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
