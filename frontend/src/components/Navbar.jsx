import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',              label: 'Switch role' },
  { to: '/bulk-consumer', label: 'Bulk consumer' },
  { to: '/collector',     label: 'Collector' },
  { to: '/recycler',      label: 'Recycler' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
        <div className="navbar-logo-icon">ET</div>
        <div>
          <div className="navbar-title">EcoTrace</div>
          <div className="navbar-subtitle">E-Waste Management &amp; EPR Tracking</div>
        </div>
      </Link>

      <div className="navbar-links">
        {links.map(l => {
          const active = l.to === '/' ? pathname === '/' : pathname.startsWith(l.to)
          return (
            <Link key={l.to} to={l.to} className={`nav-link ${active ? 'active' : ''}`}>
              {l.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
