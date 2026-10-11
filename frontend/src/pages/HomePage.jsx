import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

const PORTALS = [
  {
    to:    '/bulk-consumer',
    name:  'Bulk Consumer Portal',
    color: 'rgba(36,131,75,0.12)',
    glowColor: 'rgba(36,131,75,0.06)',
    accentColor: 'var(--green-400)',
    desc:  'Register your organisation, prepare equipment for collection, and monitor compliance progress.',
    tags:  ['Organisation details', 'Equipment records', 'Collection', 'Compliance'],
  },
  {
    to:    '/collector',
    name:  'Collector Portal',
    color: 'rgba(53,140,120,0.13)',
    glowColor: 'rgba(53,140,120,0.06)',
    accentColor: 'var(--teal-500)',
    desc:  'Review nearby requests, coordinate pickups, and keep handover records up to date.',
    tags:  ['Provider details', 'Pickup requests', 'Route planning', 'Handover'],
  },
  {
    to:    '/recycler',
    name:  'Recycler Portal',
    color: 'rgba(107,132,75,0.14)',
    glowColor: 'rgba(107,132,75,0.06)',
    accentColor: 'var(--green-400)',
    desc:  'Manage deliveries, record recycling activity, and issue certificates for processed batches.',
    tags:  ['Facility details', 'Incoming batches', 'Network overview', 'Certificates'],
  },
]

function StatCard({ val, label }) {
  return (
    <div className="card stat-card anim-fade-up">
      <div className="stat-value">{val}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.getDashboard()
      .then(d => setStats(d.impact))
      .catch(() => {})
  }, [])

  const s = stats || {
    total_weight_kg: 1382, total_devices_recycled: 1358,
    co2_avoided_kg: 6075,  certificates_issued: 6,
    orgs_registered: 8,    collectors_active: 5, recyclers_active: 5,
  }

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-chip">E-waste lifecycle tracking</div>
        <h1 className="hero-title">EcoTrace</h1>
        <p className="hero-sub">
          Coordinate collection, recycling, and compliance in one place, with clear progress
          from equipment registration through final certification.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/bulk-consumer')}>
            Start as Bulk Consumer
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/collector')}>
            Collector Portal
          </button>
        </div>

      </section>

      {/* ── Global Stats ─────────────────────────────────── */}
      <section style={{ padding: '0 24px 60px' }}>
        <div className="container">
          <div className="grid-4">
            <StatCard val={`${s.total_weight_kg.toLocaleString()} kg`} label="E-waste processed" />
            <StatCard val={`${s.co2_avoided_kg.toLocaleString()} kg`} label="CO₂ avoided" />
            <StatCard val={s.certificates_issued} label="EPR certificates issued" />
            <StatCard val={s.orgs_registered} label="Organisations registered" />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────── */}
      <section style={{ background: 'var(--bg-surface)', padding: '60px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>From collection to recovery</h2>
            <p className="muted">Follow each batch through a transparent recycling journey.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap', marginTop: 32 }}>
            {[
              { step: 0, title: 'Register', desc: 'Add your organisation and equipment' },
              { step: 1, title: 'Prepare', desc: 'Review items and create a collection batch' },
              { step: 2, title: 'Collect', desc: 'Coordinate pickup and facility handover' },
              { step: 3, title: 'Track impact', desc: 'Review recycling records and certificates' },
            ].map((p, i) => (
              <React.Fragment key={p.step}>
                <div style={{ textAlign: 'center', maxWidth: 180, padding: '16px 12px' }}>
                  <div className="journey-step-number">0{p.step + 1}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--green-400)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Step {p.step + 1}</div>
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.9rem' }}>{p.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.desc}</div>
                </div>
                {i < 3 && <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg, var(--green-500), var(--teal-500))', flexShrink: 0, margin: '0 4px' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portal Selection ─────────────────────────────── */}
      <section style={{ padding: '64px 24px' }}>
        <div className="container">
          <div className="text-center mb-4" style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Choose Your Portal</h2>
            <p className="muted">Choose the workspace that fits your role.</p>
          </div>
          <div className="portal-cards">
            {PORTALS.map(p => (
              <Link
                key={p.to}
                className="portal-card anim-fade-up"
                style={{ '--glow-color': p.glowColor }}
                to={p.to}
              >
                <div className="portal-card-index" aria-hidden="true">{p.name.slice(0, 1)}</div>
                <div className="portal-card-name" style={{ color: p.accentColor }}>{p.name}</div>
                <div className="portal-card-desc">{p.desc}</div>
                <div className="portal-card-tags">
                  {p.tags.map(t => <span key={t} className="portal-card-tag">{t}</span>)}
                </div>
                <span className="btn btn-primary w-full">
                  Open workspace <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
        EcoTrace · E-waste collection and recycling management
      </footer>
    </div>
  )
}
