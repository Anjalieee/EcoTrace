import React from 'react'
import { useNavigate } from 'react-router-dom'

const ROLES = [
  {
    id: 'bulk-consumer',
    title: 'Bulk consumer',
    subtitle: 'Organisations and institutions',
    desc: 'Register your organisation, record equipment for collection, and follow your compliance progress.',
    badge: 'Organisation',
    path: '/bulk-consumer',
  },
  {
    id: 'collector',
    title: 'Collector',
    subtitle: 'Collection providers and PROs',
    desc: 'Review collection requests, plan pickups, and track batches through handover.',
    badge: 'Collection partner',
    path: '/collector',
  },
  {
    id: 'recycler',
    title: 'Recycler',
    subtitle: 'Recycling facilities',
    desc: 'Manage incoming batches, record processing outcomes, and issue recycling certificates.',
    badge: 'Recycling facility',
    path: '/recycler',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="role-page">
      <header className="role-header">
        <div className="role-brand-mark" aria-hidden="true">ET</div>
        <p className="role-eyebrow">E-waste operations</p>
        <h1>EcoTrace</h1>
        <p className="role-intro">
          A clear view of e-waste collection, recycling, and environmental impact.
          Choose your workspace to continue.
        </p>
      </header>

      <section className="role-grid" aria-label="Choose a workspace">
        {ROLES.map((role, index) => (
          <button
            key={role.id}
            id={`login-btn-${role.id}`}
            className="role-card"
            onClick={() => navigate(role.path)}
          >
            <span className="role-index" aria-hidden="true">0{index + 1}</span>
            <span className="role-badge">{role.badge}</span>
            <span className="role-title">{role.title}</span>
            <span className="role-subtitle">{role.subtitle}</span>
            <span className="role-description">{role.desc}</span>
            <span className="role-action">
              Open workspace <span aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </section>

      <p className="role-footer">Environmental tracking for every step of the recycling journey.</p>
    </main>
  )
}