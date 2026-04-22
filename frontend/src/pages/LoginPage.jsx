import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  {
    id: 'bulk-consumer',
    icon: '🏢',
    title: 'Bulk Consumer',
    subtitle: 'IT Companies · Hospitals · Colleges · RWAs',
    desc: 'Register your organisation, triage e-waste devices, match collectors and track EPR compliance under E-Waste Rules 2022.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.2)',
    badge: 'EPR Obligated Entity',
    path: '/bulk-consumer',
  },
  {
    id: 'collector',
    icon: '🚛',
    title: 'Collector / PRO',
    subtitle: 'Registered Aggregators · Scrap Dealers · PROs',
    desc: 'View incoming batch requests via KD-Tree proximity, plan optimised pickup routes and hand over to certified recyclers.',
    color: '#60a5fa',
    glow: 'rgba(59,130,246,0.2)',
    badge: 'CPCB Registered',
    path: '/collector',
  },
  {
    id: 'recycler',
    icon: '♻️',
    title: 'Recycler',
    subtitle: 'CPCB-Certified Recyclers · Attero · Ecoreco · Karo Sambhav',
    desc: 'Process incoming batches, view network graph of collector flows, issue EPR certificates and search via Trie.',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.2)',
    badge: 'CPCB Certified',
    path: '/recycler',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [hoveredRole, setHoveredRole] = useState(null)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.1), transparent), #090e1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 99, padding: '6px 18px', marginBottom: 28,
        }}>
          <span style={{ fontSize: '1.1rem' }}>🌿</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            India's E-Waste Rules 2022 Compliant
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 30%, #4ade80 70%, #14b8a6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 16, lineHeight: 1.05,
        }}>EcoTrace</h1>

        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          End-to-end e-waste lifecycle management. Select your role to enter your portal.
        </p>
      </div>

      {/* Role Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24, maxWidth: 980, width: '100%',
      }}>
        {ROLES.map(role => (
          <button
            key={role.id}
            id={`login-btn-${role.id}`}
            onClick={() => navigate(role.path)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            style={{
              background: hoveredRole === role.id
                ? `linear-gradient(135deg, rgba(20,29,48,1), rgba(20,29,48,0.95))`
                : '#141d30',
              border: `1px solid ${hoveredRole === role.id ? role.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20, padding: '32px 28px',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              transform: hoveredRole === role.id ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow: hoveredRole === role.id
                ? `0 24px 60px ${role.glow}, 0 8px 32px rgba(0,0,0,0.5)`
                : '0 4px 24px rgba(0,0,0,0.4)',
              position: 'relative', overflow: 'hidden',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {/* Glow overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at top left, ${role.glow} 0%, transparent 60%)`,
              opacity: hoveredRole === role.id ? 1 : 0,
              transition: 'opacity 0.3s',
              pointerEvents: 'none',
            }} />

            {/* Badge */}
            <div style={{
              display: 'inline-block', background: `${role.glow}`,
              border: `1px solid ${role.color}40`,
              color: role.color, fontSize: '0.68rem', fontWeight: 700,
              padding: '3px 10px', borderRadius: 99, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 20,
            }}>{role.badge}</div>

            <div style={{ fontSize: '2.8rem', marginBottom: 16 }}>{role.icon}</div>

            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
              {role.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: role.color, fontWeight: 600, marginBottom: 14, letterSpacing: '0.02em' }}>
              {role.subtitle}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: 28 }}>
              {role.desc}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: `${role.color}15`,
              border: `1px solid ${role.color}30`,
              borderRadius: 10, padding: '10px 16px',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: role.color }}>
                Enter Portal
              </span>
              <span style={{
                color: role.color, fontSize: '1.1rem',
                transform: hoveredRole === role.id ? 'translateX(4px)' : 'translateX(0)',
                transition: 'transform 0.2s',
              }}>→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 48, textAlign: 'center' }}>
        EcoTrace v2.0 · No authentication required · 598 CPCB-certified recyclers across India
      </p>
    </div>
  )
}
