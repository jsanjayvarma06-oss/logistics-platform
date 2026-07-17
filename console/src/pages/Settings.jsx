import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Building, Key, Bell, Shield } from 'lucide-react';

const supabase = createClient(
  'https://jwqahlyybmhqpurovnnd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWFobHl5Ym1ocXB1cm92bm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNjQ0ODMsImV4cCI6MjA5OTg0MDQ4M30.J6cqGhAJQma5Zccq0ZTl94-1obR_qsw7MF148MBS5Eo'
);

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid var(--border)' }}>
        <Icon size={16} color="var(--primary)" />
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const session = JSON.parse(localStorage.getItem('logistics_session') || '{}');
  const [email] = useState(session.email || '');
  const [tenantId] = useState(session.tenant_id || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTenant, setInviteTenant] = useState(tenantId);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const flash = (type, text) => {
    if (type === 'ok') { setMsg(text); setErr(''); }
    else { setErr(text); setMsg(''); }
    setTimeout(() => { setMsg(''); setErr(''); }, 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return flash('err', 'Passwords do not match');
    if (newPassword.length < 6) return flash('err', 'Password must be at least 6 characters');
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) flash('err', error.message);
    else { flash('ok', 'Password updated'); setNewPassword(''); setConfirmPassword(''); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return flash('err', 'Enter an email address');
    setLoading(true);
    const { error } = await supabase.auth.admin?.inviteUserByEmail?.(inviteEmail, {
      data: { tenant_id: inviteTenant },
    }).catch(() => ({ error: { message: 'Admin invite requires service role key. Use Supabase dashboard → Auth → Users → Invite instead.' } }));
    setLoading(false);
    if (error) flash('err', error.message);
    else { flash('ok', `Invite sent to ${inviteEmail}`); setInviteEmail(''); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <Section icon={User} title="Your account">
        <div className="settings-row">
          <span className="settings-label">Email</span>
          <span className="settings-value">{email}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Role</span>
          <span className="status-badge" style={{ background: '#6366f120', color: '#6366f1' }}>Admin</span>
        </div>
      </Section>

      <Section icon={Building} title="Tenant">
        <div className="settings-row">
          <span className="settings-label">Tenant ID</span>
          <code style={{ fontSize: '0.82rem', background: 'var(--bg)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>{tenantId}</code>
        </div>
        <div className="settings-row">
          <span className="settings-label">Plan</span>
          <span className="status-badge" style={{ background: '#10b98120', color: '#10b981' }}>Starter — free</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Console URL</span>
          <span style={{ fontSize: '0.78rem', color: '#6366f1' }}>{window.location.origin}</span>
        </div>
      </Section>

      <Section icon={Key} title="Change password">
        <form onSubmit={handleChangePassword}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <input
              type="password" placeholder="New password"
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
            />
            <input
              type="password" placeholder="Confirm password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="form-actions" style={{ marginTop: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </Section>

      <Section icon={Shield} title="Invite a user">
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Invite a team member. They'll get an email to set their password and will be assigned to your tenant.
        </p>
        <form onSubmit={handleInvite}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <input
              type="email" placeholder="teammate@company.com"
              value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            />
            <input
              placeholder="Tenant ID"
              value={inviteTenant} onChange={e => setInviteTenant(e.target.value)}
            />
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Tip: To invite from Supabase directly — Authentication → Users → Invite user → add metadata <code style={{ fontSize: '0.7rem' }}>{`{"tenant_id":"${tenantId}"}`}</code>
          </p>
          <div className="form-actions" style={{ marginTop: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send invite'}
            </button>
          </div>
        </form>
      </Section>

      <Section icon={Bell} title="Notifications">
        {[
          { label: 'Low stock alerts', desc: 'Get notified when stock drops below minimum level' },
          { label: 'Order status changes', desc: 'Notify on dispatch, delivery and cancellation' },
          { label: 'Driver offline', desc: 'Alert when a driver goes offline mid-route' },
        ].map(({ label, desc }) => (
          <div key={label} className="settings-row" style={{ paddingBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </Section>
    </div>
  );
}
