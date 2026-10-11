import React, { useState, useEffect } from 'react'
import PipelineBar from '../components/PipelineBar'
import EnvImpactCounter from '../components/EnvImpactCounter'
import { api } from '../utils/api'
import { CITIES, getCityCoordinates } from '../utils/cities'

function StatusBadge({ status }) {
  const map = {
    pending:            ['badge-amber',  'Pending'],
    collector_assigned: ['badge-blue',   'Assigned'],
    collected:          ['badge-teal',   'Collected'],
    at_recycler:        ['badge-purple', 'At Recycler'],
    certified:          ['badge-green',  'Certified ✓'],
  }
  const [cls, label] = map[status] || ['badge-red', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

// ─── MODULE 0: Registry & Capacity ───────────────────────────────────────────
function Module0() {
  const [collectors, setCollectors] = useState([])
  const [selectedCity, setSelectedCity] = useState('Delhi')
  const [form, setForm] = useState({ name: '', registration_number: '', address: '', city: 'Delhi', service_radius_km: 20, weekly_capacity_kg: 500 })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const cityCollectors = collectors.filter(c => c.city.toLowerCase() === selectedCity.toLowerCase())

  useEffect(() => {
    api.getAllCollectorsPortal().then(d => setCollectors(d.collectors || [])).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const location = getCityCoordinates(form.city)
      const res = await api.registerCollector({ ...form, ...location, accepted_types: ['IT Equipment', 'Batteries'] })
      setMsg(` Collector registered! ID: ${res.collector_id}`)
      setSelectedCity(form.city)
      const d = await api.getAllCollectorsPortal()
      setCollectors(d.collectors || [])
    } catch (e) { setMsg(`❌ ${e.message}`) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Provider registration</h2>
      <p className="section-sub">Register as a PRO/Aggregator with CPCB registration. Set your service radius and weekly capacity.</p>

      <div className="grid-2" style={{ gap: 24 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register Collector</h3>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Organisation Name',    key: 'name',                placeholder: 'GreenPick PRO' },
              { label: 'CPCB Registration No', key: 'registration_number', placeholder: 'CPCB-COL-2024-001' },
              { label: 'Address',              key: 'address',             placeholder: 'Full office address' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-input form-select" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Service Radius (km)</label>
                <input className="form-input" type="number" value={form.service_radius_km}
                  onChange={e => setForm(p => ({ ...p, service_radius_km: Number(e.target.value) }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Weekly Capacity (kg)</label>
                <input className="form-input" type="number" value={form.weekly_capacity_kg}
                  onChange={e => setForm(p => ({ ...p, weekly_capacity_kg: Number(e.target.value) }))} />
              </div>
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.startsWith('') ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', color: msg.startsWith('') ? 'var(--green-400)' : 'var(--rose-500)', fontSize: '0.87rem', marginBottom: 12 }}>{msg}</div>}
            <button className="btn btn-primary w-full" type="submit">Register Collector</button>
          </form>
        </div>

        <div className="card" style={{ overflowY: 'auto', maxHeight: 520 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Collectors in {selectedCity} <span className="badge badge-green">{cityCollectors.length}</span></h3>
            <select aria-label="Filter collectors by city" className="form-input form-select" style={{ maxWidth: 150 }} value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
              {CITIES.map(city => <option key={city}>{city}</option>)}
            </select>
          </div>
          {loading ? <div className="loading-wrap"><div className="loader" /></div> :
            cityCollectors.map(c => (
              <div className="entity-card" key={c.id} style={{ marginBottom: 12, flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <div className="entity-name">{c.name}</div>
                    <div className="entity-meta">{c.registration_number}</div>
                    <div className="entity-meta">{c.city} · {c.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${c.is_available ? 'badge-green' : 'badge-red'}`}>{c.is_available ? 'Available' : 'Busy'}</span>
                    <div className="rating-stars" style={{ marginTop: 6 }}>{'★'.repeat(Math.round(c.rating))}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">Capacity: {c.weekly_capacity_kg} kg/wk</span>
                  <span className="badge badge-teal">Radius: {c.service_radius_km} km</span>
                  <span className="badge badge-amber">Batches: {c.batches_collected}</span>
                </div>
                {/* Capacity bar */}
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Weekly capacity</span><span>{c.weekly_capacity_kg} kg</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (c.batches_collected / 0.6))}%` }} /></div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── MODULE 1: Incoming Batch Feed ────────────────────────────────────────────
function Module1() {
  const [collectors, setCollectors] = useState([])
  const [colId, setColId] = useState(1)
  const [feed, setFeed]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.getAllCollectorsPortal().then(d => setCollectors(d.collectors || [])) }, [])

  const fetchFeed = async () => {
    setLoading(true)
    try { setFeed(await api.getCollectorFeed(colId)) }
    catch(e) { alert(e.message) }
    finally { setLoading(false) }
  }

  const handleAssign = async (bId) => {
    try {
      await api.assignBatch(bId, colId)
      setMsg(' Batch assigned!')
      fetchFeed()
    } catch(e) { setMsg(`❌ ${e.message}`) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Pickup requests</h2>
      <p className="section-sub">Review available collection requests near your service area.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 320, marginBottom: 0 }}>
          <label className="form-label">Select Collector</label>
          <select className="form-input form-select" value={colId} onChange={e => setColId(Number(e.target.value))}>
            {collectors.map(c => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={fetchFeed} disabled={loading}>{loading ? 'Loading…' : 'Load Feed'}</button>
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.startsWith('') ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', color: msg.startsWith('') ? 'var(--green-400)' : 'var(--rose-500)', fontSize: '0.87rem', marginBottom: 16 }}>{msg}</div>}

      {feed && (
        <div className="anim-fade-in">
          <div className="grid-2" style={{ gap: 24 }}>
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Assigned Batches <span className="badge badge-green">{feed.assigned_batches?.length || 0}</span></h3>
              {!feed.assigned_batches?.length ? <div className="empty-state"><p>No batches assigned yet</p></div> :
                feed.assigned_batches.map(b => (
                  <div className="card card-sm" key={b.id} style={{ marginBottom: 12 }}>
                    <div className="flex justify-between items-center">
                      <span className="mono">{b.batch_uid}</span>
                      <span className={`badge ${b.status === 'certified' ? 'badge-green' : 'badge-blue'}`}>{b.status}</span>
                    </div>
                    <div className="entity-meta mt-4" style={{ marginTop: 8 }}>{b.estimated_weight_kg} kg · {b.total_devices} devices</div>
                    {b.status === 'collector_assigned' && (
                      <button className="btn btn-primary btn-sm mt-4" style={{ marginTop: 8 }}
                        onClick={async () => { await api.collectBatch(b.id); fetchFeed() }}>
                        Mark Collected
                      </button>
                    )}
                  </div>
                ))
              }
            </div>

            <div>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Nearby Pending Batches <span className="badge badge-amber">{feed.nearby_pending_batches?.length || 0}</span></h3>
              {!feed.nearby_pending_batches?.length ? <div className="empty-state"><p>No nearby requests are available.</p></div> :
                feed.nearby_pending_batches.map(b => (
                  <div className="card card-sm" key={b.id} style={{ marginBottom: 12 }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="entity-name" style={{ fontSize: '0.875rem' }}>{b.org_name}</div>
                        <div className="entity-meta">{b.org_city} · {b.distance_km} km away</div>
                      </div>
                      <span className="badge badge-amber">{b.estimated_weight_kg} kg</span>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => handleAssign(b.id)}>
                      Accept Batch
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MODULE 2: Drive Planner ──────────────────────────────────────────────────
function Module2() {
  const [collectors, setCollectors] = useState([])
  const [colId, setColId] = useState(1)
  const [plan, setPlan]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.getAllCollectorsPortal().then(d => setCollectors(d.collectors || [])) }, [])

  const fetchPlan = async () => {
    setLoading(true)
    try { setPlan(await api.getDrivePlan(colId)) }
    catch(e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Pickup route</h2>
      <p className="section-sub">Plan an efficient order for your assigned collection stops.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 320, marginBottom: 0 }}>
          <label className="form-label">Select Collector</label>
          <select className="form-input form-select" value={colId} onChange={e => setColId(Number(e.target.value))}>
            {collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={fetchPlan} disabled={loading}>{loading ? 'Planning…' : 'Generate Drive Plan'}</button>
      </div>

      {plan && (
        <div className="anim-fade-in">
          <div className="grid-3 mb-4" style={{ gap: 16, marginBottom: 24 }}>
            <div className="card stat-card"><div className="stat-value">{plan.total_stops}</div><div className="stat-label">Pickup Stops</div></div>
            <div className="card stat-card"><div className="stat-value">{plan.total_weight_kg} kg</div><div className="stat-label">Total Weight</div></div>
            <div className="card stat-card"><div className="stat-value green">Optimised</div><div className="stat-label">Route Status</div></div>
          </div>

          {!plan.drive_stops?.length ? (
              <div className="empty-state"><p>No assigned pickups are waiting for collection.</p></div>
          ) : (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Pickup route</h3>
              <div className="timeline">
                {plan.drive_stops.map((s, i) => (
                  <div className="timeline-item" key={s.batch_id}>
                    <div className="timeline-dot done" />
                    <div className="timeline-body">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge badge-blue">Stop {i + 1}</span>
                        <span className="timeline-title">{s.org_name}</span>
                      </div>
                      <div className="timeline-date">{s.org_address}, {s.org_city}</div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                        <span className="badge badge-teal">{s.weight_kg} kg</span>
                        <span className="badge badge-amber">{s.devices} devices</span>
                        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.batch_uid}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MODULE 3: Handover & Certificate Chain ────────────────────────────────────
function Module3() {
  const [collectors, setCollectors] = useState([])
  const [colId, setColId]   = useState(1)
  const [certs, setCerts]   = useState([])
  const [assigned, setAssigned] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.getAllCollectorsPortal().then(d => setCollectors(d.collectors || [])) }, [])

  const fetchData = async (id) => {
    setLoading(true)
    try {
      const [cc, aa] = await Promise.all([api.getColCerts(id), api.getAssigned(id)])
      setCerts(cc.certificates || [])
      setAssigned(aa.batches || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData(1) }, [])

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Handover records</h2>
      <p className="section-sub">Handover batches to recyclers and view your EPR certificate trail.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 320, marginBottom: 0 }}>
          <label className="form-label">Select Collector</label>
          <select className="form-input form-select" value={colId}
            onChange={e => { setColId(Number(e.target.value)); fetchData(Number(e.target.value)) }}>
            {collectors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="loading-wrap"><div className="loader" /></div> : (
        <div className="grid-2" style={{ gap: 24 }}>
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Collected Batches <span className="badge badge-blue">{assigned.length}</span></h3>
            {!assigned.length ? <div className="empty-state"><p>No batches collected yet</p></div> :
              assigned.filter(b => b.status === 'collected' || b.status === 'at_recycler').map(b => (
                <div className="card card-sm" key={b.id} style={{ marginBottom: 12 }}>
                  <div className="flex justify-between items-center mb-4" style={{ marginBottom: 8 }}>
                    <span className="mono">{b.batch_uid}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="entity-meta">{b.estimated_weight_kg} kg · {b.total_devices} devices</div>
                  {b.status === 'collected' && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                      <span className="badge badge-amber">Awaiting recycler handover</span>
                    </div>
                  )}
                </div>
              ))
            }
          </div>

          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Certificate Chain <span className="badge badge-green">{certs.length}</span></h3>
            {!certs.length ? <div className="empty-state"><p>No certificates are available for this collector yet.</p></div> :
              certs.map(c => (
                <div className="card card-sm" key={c.id} style={{ marginBottom: 12, borderColor: 'rgba(34,197,94,0.2)' }}>
                  <div className="mono green" style={{ marginBottom: 8 }}>{c.certificate_uid}</div>
                  <div className="grid-2" style={{ gap: 8, fontSize: '0.8rem' }}>
                    <div><span className="muted">Weight:</span> <strong>{c.weight_kg} kg</strong></div>
                    <div><span className="muted">CO₂:</span> <strong className="green">{c.co2_avoided_kg} kg</strong></div>
                    <div><span className="muted">Copper:</span> <strong>{c.copper_recovered_kg} kg</strong></div>
                    <div><span className="muted">Gold:</span> <strong className="amber">{c.gold_recovered_g} g</strong></div>
                  </div>
                  <div className="entity-meta" style={{ marginTop: 8 }}>Issued: {c.issued_at}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

const COLLECTOR_MODULES = [
  { id: 0, label: 'Provider details', component: Module0 },
  { id: 1, label: 'Pickup requests', component: Module1 },
  { id: 2, label: 'Route planning', component: Module2 },
  { id: 3, label: 'Handover records', component: Module3 },
]

export default function CollectorPortal() {
  const [active, setActive] = useState(0)
  const ActiveComp = COLLECTOR_MODULES[active].component

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div>
          <div style={{ padding: '12px 12px 4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Collector workspace
          </div>
          {COLLECTOR_MODULES.map(m => (
            <button key={m.id} className={`sidebar-btn ${active === m.id ? 'active' : ''}`} onClick={() => setActive(m.id)}>
              <span className="sidebar-icon">0{m.id + 1}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="portal-content">
        <PipelineBar activeStep={active} />
        <EnvImpactCounter />
        <ActiveComp />
      </main>
    </div>
  )
}
