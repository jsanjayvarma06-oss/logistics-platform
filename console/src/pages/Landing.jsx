import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '🗺', title: 'Live Fleet Map', desc: 'OpenStreetMap-powered real-time driver locations. Color-coded by priority.', color: 'rgba(100,112,243,.12)', iconColor: '#6470f3' },
  { icon: '⚡', title: 'Auto Dispatch Planning', desc: 'One click assigns all confirmed orders using nearest-neighbor route optimization.', color: 'rgba(0,214,143,.12)', iconColor: '#00d68f' },
  { icon: '📦', title: 'Multi-Warehouse Inventory', desc: 'FIFO batch tracking. Automatic low-stock alerts before you run out.', color: 'rgba(255,176,32,.12)', iconColor: '#ffb020' },
  { icon: '🔗', title: 'Customer Order Tracking', desc: 'Shareable tracking links. Customers see live progress without an account.', color: 'rgba(180,124,248,.12)', iconColor: '#b47cf8' },
  { icon: '📊', title: 'Bulk CSV Import', desc: 'Import hundreds of orders in seconds from any spreadsheet.', color: 'rgba(61,158,255,.12)', iconColor: '#3d9eff' },
  { icon: '🏢', title: 'Multi-Tenant Architecture', desc: 'Onboard a new client in under 2 minutes. Full data isolation per tenant.', color: 'rgba(0,200,212,.12)', iconColor: '#00c8d4' },
  { icon: '↩', title: 'Return Management', desc: 'Process returns with one click. Auto-restock and reason tracking.', color: 'rgba(255,77,106,.12)', iconColor: '#ff4d6a' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Delivery rate trends, driver performance, and order volume charts.', color: 'rgba(0,214,143,.12)', iconColor: '#00d68f' },
  { icon: '🕐', title: 'Predicted Delivery Time', desc: 'ETA based on driver distance. Shown to customers automatically.', color: 'rgba(100,112,243,.12)', iconColor: '#6470f3' },
];

const STEPS = [
  { n: '01', t: 'Add inventory', d: 'Create products, warehouses, and stock. Import from CSV or API. Alerts fire automatically.' },
  { n: '02', t: 'Receive orders', d: 'Orders arrive via console, CSV, or API. Each gets a customer tracking link automatically.' },
  { n: '03', t: 'Auto-plan dispatch', d: 'Click Auto Plan — Prodis groups orders by area, assigns drivers, creates optimized routes.' },
  { n: '04', t: 'Track & complete', d: 'Watch drivers on the live map. Stock auto-deducts on dispatch. Analytics update real-time.' },
];

const PLANS = [
  { name: 'Starter', price: '₹0', period: '/ month', desc: 'Perfect for getting started. No card required.', featured: false, features: ['Up to 500 orders/month','2 warehouses','5 drivers','CSV import','Customer tracking links','Live fleet map',], disabled: ['Analytics dashboard','API access','Priority support'] },
  { name: 'Growth', price: '₹4,999', period: '/ month', desc: 'For growing logistics operations with real SLAs.', featured: true, features: ['Unlimited orders','Unlimited warehouses','Unlimited drivers','CSV import + API','Customer tracking links','Live fleet map','Analytics dashboard','API access','Email support'], disabled: [] },
  { name: 'Enterprise', price: 'Custom', period: '/ month', desc: 'Dedicated infra, custom SLAs, white-labeling.', featured: false, features: ['Everything in Growth','Dedicated infrastructure','White-label branding','Custom integrations','SLA guarantee (99.9%)','Dedicated Slack support','Onboarding assistance','Invoice billing','Security review'], disabled: [] },
];

const TESTIMONIALS = [
  { q: '"We went from managing 50 orders in WhatsApp groups to 300+ fully tracked in Prodis. Auto-plan saves our dispatcher 2 hours every morning."', name: 'Ravi Kumar', role: 'Operations Manager, QuickDeliver Hyderabad', initials: 'RK' },
  { q: '"The live map is the first thing our team opens every morning. Seeing all drivers and orders in one screen changed how we handle urgent deliveries."', name: 'Priya Sharma', role: 'Logistics Lead, BlueDart Partner', initials: 'PS' },
  { q: '"Setting up a new client takes 2 minutes — create a tenant, invite their admin, done. We\'ve onboarded 8 clients this month without writing any code."', name: 'Anil Mehta', role: 'CTO, Logistics SaaS Startup', initials: 'AM' },
];

const s = {
  page: { fontFamily: "'Inter', sans-serif", background: '#060810', color: '#eef0f8', lineHeight: 1.6, overflowX: 'hidden' },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6,8,16,0.92)', borderBottom: '1px solid #1f2440', backdropFilter: 'blur(12px)' },
  navMark: { width: 32, height: 32, background: 'linear-gradient(135deg,#6470f3,#b47cf8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.9rem', fontFamily: "'Space Grotesk', sans-serif" },
  navName: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#eef0f8' },
  btnGhost: { padding: '0.38rem 0.9rem', fontSize: '0.8rem', color: '#a8aec8', border: '1px solid #2a3055', borderRadius: 6, background: 'transparent', cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' },
  btnPrimary: { padding: '0.38rem 1rem', fontSize: '0.8rem', color: '#fff', background: '#6470f3', border: '1px solid #6470f3', borderRadius: 6, cursor: 'pointer', fontWeight: 500, textDecoration: 'none', fontFamily: 'inherit' },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={s.navMark}>P</div>
          <span style={s.navName}>Prodis</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
          {['#features','#how','#pricing'].map((h,i) => (
            <a key={h} href={h} style={{ fontSize: '0.83rem', color: '#5c6488', textDecoration: 'none' }}>
              {['Features','How it works','Pricing'][i]}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button style={s.btnGhost} onClick={() => navigate('/dashboard')}>Sign in</button>
          <button style={s.btnPrimary} onClick={() => navigate('/dashboard')}>Get started →</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, background: 'radial-gradient(circle,rgba(100,112,243,.13) 0%,transparent 65%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 860 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.28rem 0.85rem', background: 'rgba(100,112,243,.1)', border: '1px solid rgba(100,112,243,.25)', borderRadius: 20, fontSize: '0.7rem', color: '#8490f8', fontWeight: 500, marginBottom: '1.5rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6470f3', display: 'block' }} />
            Route optimization · Live fleet map · Multi-tenant
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.4rem,5vw,3.8rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Logistics platform built<br />
            for <span style={{ background: 'linear-gradient(135deg,#6470f3,#b47cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>modern ops teams</span>
          </h1>

          <p style={{ fontSize: '1rem', color: '#a8aec8', maxWidth: 520, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            Real-time fleet tracking, intelligent dispatch planning, multi-warehouse inventory, and customer order tracking — all in one platform. Deploy in minutes.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: '#6470f3', color: '#fff', border: '1px solid #6470f3', boxShadow: '0 0 32px rgba(100,112,243,.25)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Start free <span style={{ opacity: 0.7, fontSize: '0.78rem' }}>— No card needed</span>
            </button>
            <a href="#features" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: 'transparent', color: '#a8aec8', border: '1px solid #2a3055', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              See features
            </a>
          </div>

          {/* Mini dashboard preview */}
          <div style={{ background: '#111422', border: '1px solid #1f2440', borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.6)', maxWidth: 780, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ background: '#0c0f1a', borderBottom: '1px solid #1f2440', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {['#ff4d6a','#ffb020','#00d68f'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
              <div style={{ flex: 1, background: '#111422', borderRadius: 4, padding: '0.22rem 0.75rem', margin: '0 0.75rem', fontSize: '0.67rem', color: '#5c6488', fontFamily: "'JetBrains Mono', monospace" }}>prodis.app/dashboard</div>
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem' }}>
              {[['47','Delivered','#00d68f'],['12','Pending','#ffb020'],['8','In Transit','#3d9eff'],['6','Drivers','#b47cf8']].map(([v,l,c]) => (
                <div key={l} style={{ background: '#0c0f1a', border: '1px solid #1f2440', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: '0.6rem', color: '#5c6488', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 1.25rem 1.25rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.6rem' }}>
              <div style={{ background: '#0c0f1a', border: '1px solid #1f2440', borderRadius: 8, padding: '0.85rem' }}>
                <div style={{ fontSize: '0.62rem', color: '#5c6488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Recent orders</div>
                {[['ORD-7842','Acme Corp','delivered','#00d68f','rgba(0,214,143,.12)'],['ORD-7843','QuickShip','in transit','#3d9eff','rgba(61,158,255,.12)'],['ORD-7844','BlueDart','pending','#ffb020','rgba(255,176,32,.12)']].map(([n,c,s,tc,bg]) => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', marginBottom: '0.38rem' }}>
                    <span style={{ color: '#8490f8', fontFamily: "'JetBrains Mono', monospace" }}>{n}</span>
                    <span style={{ color: '#a8aec8' }}>{c}</span>
                    <span style={{ background: bg, color: tc, padding: '0.1rem 0.4rem', borderRadius: 20, fontSize: '0.6rem', fontWeight: 600 }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0c0f1a', border: '1px solid #1f2440', borderRadius: 8, padding: '0.85rem' }}>
                <div style={{ fontSize: '0.62rem', color: '#5c6488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Delivery rate</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#00d68f' }}>87%</div>
                <div style={{ height: 4, background: '#111422', borderRadius: 2, marginTop: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ width: '87%', height: '100%', background: '#00d68f', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: '#5c6488', marginTop: '0.35rem' }}>↑ 4% vs last week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', padding: '1.75rem 2rem', background: '#111422', borderTop: '1px solid #1f2440', borderBottom: '1px solid #1f2440' }}>
        {[['10K+','Orders/month'],['99.9%','Uptime'],['<30ms','API response'],['Free','To start']].map(([v,l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: '#8490f8' }}>{v}</div>
            <div style={{ fontSize: '0.68rem', color: '#5c6488', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.1rem' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: '5rem 2rem', background: '#0c0f1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8490f8', fontWeight: 600, marginBottom: '0.75rem' }}>Features</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem,3vw,2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Everything your ops team needs</h2>
          <p style={{ fontSize: '0.9rem', color: '#a8aec8', maxWidth: 520, lineHeight: 1.75, marginBottom: '3rem' }}>Built for logistics — not retrofitted from a generic SaaS template.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 1, background: '#1f2440', border: '1px solid #1f2440', borderRadius: 14, overflow: 'hidden' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#111422', padding: '1.75rem', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#181c2e'}
                onMouseLeave={e => e.currentTarget.style.background = '#111422'}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: '1rem', background: f.color }}>{f.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: '#eef0f8', marginBottom: '0.4rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#5c6488', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8490f8', fontWeight: 600, marginBottom: '0.75rem' }}>How it works</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem,3vw,2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>From order to delivery in 4 steps</h2>
          <p style={{ fontSize: '0.9rem', color: '#a8aec8', maxWidth: 520, lineHeight: 1.75, marginBottom: '3rem' }}>Designed for teams with real delivery SLAs — inspired by how Flexport and Locus run operations.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {STEPS.map(step => (
              <div key={step.n}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(100,112,243,.1)', border: '1px solid rgba(100,112,243,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#8490f8', fontWeight: 600, marginBottom: '1rem' }}>{step.n}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>{step.t}</div>
                <div style={{ fontSize: '0.8rem', color: '#5c6488', lineHeight: 1.6 }}>{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '5rem 2rem', background: '#0c0f1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8490f8', fontWeight: 600, marginBottom: '0.75rem' }}>Pricing</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem,3vw,2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: '0.9rem', color: '#a8aec8', maxWidth: 520, lineHeight: 1.75, marginBottom: '3rem' }}>Start free. Scale when you need to.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{ background: plan.featured ? 'linear-gradient(135deg,rgba(100,112,243,.07) 0%,#111422 100%)' : '#111422', border: `1px solid ${plan.featured ? 'rgba(100,112,243,.4)' : '#1f2440'}`, borderRadius: 12, padding: '2rem', position: 'relative' }}>
                {plan.featured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6470f3', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>Most popular</div>}
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c6488', marginBottom: '0.5rem' }}>{plan.name}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: '#eef0f8', marginBottom: '0.25rem' }}>{plan.price} <span style={{ fontSize: '0.9rem', color: '#5c6488', fontWeight: 400 }}>{plan.period}</span></div>
                <div style={{ fontSize: '0.78rem', color: '#5c6488', marginBottom: '1.5rem', lineHeight: 1.6 }}>{plan.desc}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.75rem' }}>
                  {plan.features.map(f => <li key={f} style={{ fontSize: '0.78rem', color: '#a8aec8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#00d68f', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</li>)}
                  {plan.disabled.map(f => <li key={f} style={{ fontSize: '0.78rem', color: '#5c6488', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ flexShrink: 0 }}>—</span>{f}</li>)}
                </ul>
                <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '0.65rem', fontSize: '0.82rem', fontWeight: 500, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', background: plan.featured ? '#6470f3' : 'transparent', color: plan.featured ? '#fff' : '#a8aec8', border: `1px solid ${plan.featured ? '#6470f3' : '#2a3055'}` }}>
                  {plan.name === 'Enterprise' ? 'Contact us' : plan.name === 'Starter' ? 'Get started free' : 'Start Growth plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8490f8', fontWeight: 600, marginBottom: '0.75rem' }}>What teams say</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem,3vw,2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '3rem' }}>Built for people who ship things</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: '#111422', border: '1px solid #1f2440', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ fontSize: '0.83rem', color: '#a8aec8', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>{t.q}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6470f3,#b47cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#eef0f8' }}>{t.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#5c6488' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'linear-gradient(135deg,rgba(100,112,243,.07) 0%,rgba(180,124,248,.04) 100%)', borderTop: '1px solid #1f2440', borderBottom: '1px solid #1f2440' }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.75rem,3vw,2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>Ready to streamline your deliveries?</h2>
        <p style={{ color: '#a8aec8', marginBottom: '2rem', fontSize: '0.92rem' }}>Join logistics teams that moved from spreadsheets and WhatsApp to a real platform.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: '#6470f3', color: '#fff', border: '1px solid #6470f3', boxShadow: '0 0 32px rgba(100,112,243,.2)' }}>Start for free →</button>
          <a href="#features" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, borderRadius: 8, cursor: 'pointer', background: 'transparent', color: '#a8aec8', border: '1px solid #2a3055', textDecoration: 'none', display: 'inline-block' }}>Learn more</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '2.5rem 2rem', borderTop: '1px solid #1f2440' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#a8aec8' }}>⬡ Prodis</div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[['#features','Features'],['#pricing','Pricing'],['mailto:hello@prodis.app','Contact']].map(([h,l]) => (
              <a key={l} href={h} style={{ fontSize: '0.75rem', color: '#5c6488', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#5c6488' }}>© 2026 Prodis. Built with ♥ in Hyderabad.</div>
        </div>
      </footer>
    </div>
  );
}
