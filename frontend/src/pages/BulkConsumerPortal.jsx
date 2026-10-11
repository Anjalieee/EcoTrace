import React, { useState, useEffect } from 'react'
import PipelineBar from '../components/PipelineBar'
import EnvImpactCounter from '../components/EnvImpactCounter'
import { api } from '../utils/api'
import CollectorMap from '../components/bulk-consumer/CollectorMap'
import { CITIES, getCityCoordinates } from '../utils/cities'

// ─── Status badge helper ────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:            ['badge-amber',  'Pending'],
    collector_assigned: ['badge-blue',   'Collector Assigned'],
    collected:          ['badge-teal',   'Collected'],
    at_recycler:        ['badge-purple', 'At Recycler'],
    certified:          ['badge-green',  'Certified ✓'],
  }
  const [cls, label] = map[status] || ['badge-red', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

// ─── MODULE 0: Registry ──────────────────────────────────────────────────────
function Module0({ setActiveModule }) {
  const [orgs, setOrgs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('Delhi')
  const [form, setForm]     = useState({ name: '', gst_number: '', org_type: 'IT Company', address: '', city: 'Delhi', employee_count: 100 })
  const [msg, setMsg]       = useState('')
  const cityOrgs = orgs.filter(o => o.city.toLowerCase() === selectedCity.toLowerCase())

  useEffect(() => {
    api.getOrgs().then(d => setOrgs(d.organisations || [])).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const location = getCityCoordinates(form.city)
      const res = await api.registerOrg({ ...form, ...location, employee_count: Number(form.employee_count) })
      setMsg(` Registered! Org ID: ${res.org_id}`)
      setSelectedCity(form.city)
      const d = await api.getOrgs()
      setOrgs(d.organisations || [])
    } catch (e) { setMsg(`❌ ${e.message}`) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Organisation registration</h2>
      <p className="section-sub">Add your organisation details to begin tracking equipment collection and compliance.</p>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* ─ Registration Form ─ */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register Organisation</h3>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Organisation Name', key: 'name', type: 'text', placeholder: 'e.g. TechCorp India Ltd' },
              { label: 'GST Number',        key: 'gst_number', type: 'text', placeholder: '29AABCT1332L1ZF' },
              { label: 'Address',           key: 'address', type: 'text', placeholder: 'Full address' },
              { label: 'No. of Employees',  key: 'employee_count', type: 'number', placeholder: '100' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Organisation Type</label>
              <select className="form-input form-select" value={form.org_type} onChange={e => setForm(p => ({ ...p, org_type: e.target.value }))}>
                {['IT Company','Hospital','College','RWA','Co-working Space','Educational Institution'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-input form-select" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.startsWith('') ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', color: msg.startsWith('') ? 'var(--green-400)' : 'var(--rose-500)', fontSize: '0.87rem', marginBottom: 12 }}>{msg}</div>}
            <button className="btn btn-primary w-full" type="submit">Register Organisation</button>
          </form>
        </div>

        {/* ─ Registered Orgs List ─ */}
        <div className="card" style={{ overflowY: 'auto', maxHeight: 520 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Organisations in {selectedCity} <span className="badge badge-green">{cityOrgs.length}</span></h3>
            <select aria-label="Filter organisations by city" className="form-input form-select" style={{ maxWidth: 150 }} value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
              {CITIES.map(city => <option key={city}>{city}</option>)}
            </select>
          </div>
          {loading ? <div className="loading-wrap"><div className="loader" /></div> :
            cityOrgs.map(o => (
              <div className="entity-card mb-4" key={o.id} style={{ marginBottom: 12 }}>
                <div>
                  <div className="entity-name">{o.name}</div>
                  <div className="entity-meta">{o.org_type} · {o.city}</div>
                  <div className="entity-meta mono" style={{ marginTop: 4 }}>{o.gst_number}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className="badge badge-amber">EPR: {o.epr_obligation_kg} kg/yr</span>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule(2)}>Match Collector</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── MODULE 1: Device Triage ─────────────────────────────────────────────────
function Module1({ setActiveModule, onBatchCreated }) {
  const [devices, setDevices]   = useState([])
  const [orgs, setOrgs]         = useState([])
  const [orgId, setOrgId]       = useState(1)
  const [cart, setCart]         = useState({})
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    api.getDevices().then(d => setDevices(d.devices || []))
    api.getOrgs().then(d => setOrgs(d.organisations || []))
  }, [])

  const addToCart = (id) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }))
  const removeFromCart = (id) => setCart(p => { const n = { ...p }; if (n[id] > 1) n[id]--; else delete n[id]; return n })

  const handleSubmit = async () => {
    if (!Object.keys(cart).length) return
    setLoading(true)
    try {
      const devArr = Object.entries(cart).map(([did, qty]) => ({ device_id: Number(did), quantity: qty }))
      const res = await api.createBatch({ org_id: orgId, devices: devArr })
      setResult(res)
      onBatchCreated({ ...res, orgId, org: orgs.find(org => org.id === orgId) })
      setActiveModule(2)
    } catch(e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Equipment records</h2>
      <p className="section-sub">Select the equipment for collection. Items are grouped by their recommended handling route.</p>

      {/* Org Selector */}
      <div className="form-group" style={{ maxWidth: 320, marginBottom: 20 }}>
        <label className="form-label">Select Organisation</label>
        <select className="form-input form-select" value={orgId} onChange={e => setOrgId(Number(e.target.value))}>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name} ({o.city})</option>)}
        </select>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Device Catalogue */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Device Catalogue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {devices.map(d => (
              <div key={d.id} className="entity-card">
                <div>
                  <div className="entity-name">{d.name}</div>
                  <div className="entity-meta">{d.category} · {d.avg_weight_kg} kg avg · EPR: {d.epr_category}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {cart[d.id] && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => removeFromCart(d.id)}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{cart[d.id]}</span>
                    </>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => addToCart(d.id)}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart + Triage Result */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Selected Devices</h3>
            {!Object.keys(cart).length ? (
              <div className="empty-state"><p>No equipment selected yet</p></div>
            ) : (
              <>
                {Object.entries(cart).map(([did, qty]) => {
                  const d = devices.find(x => x.id === Number(did))
                  return d ? (
                    <div key={did} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                      <span>{d.name}</span>
                      <span className="badge badge-blue">× {qty}</span>
                    </div>
                  ) : null
                })}
                <button className="btn btn-primary w-full mt-4" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Triaging…' : 'Submit for Triage →'}
                </button>
              </>
            )}
          </div>

          {result && (
            <div className="card anim-fade-in">
              <h3 style={{ fontWeight: 700, marginBottom: 12, color: 'var(--green-400)' }}> Batch Created &amp; Triaged</h3>
              <div style={{ marginBottom: 12 }}>
                <span className="mono">Batch UID: </span>
                <span className="mono bold green">{result.batch_uid}</span>
              </div>
              <div className="grid-2 mb-4" style={{ gap: 12 }}>
                <div className="card card-sm stat-card"><div className="stat-value">{result.data.total_devices}</div><div className="stat-label">Devices</div></div>
                <div className="card card-sm stat-card"><div className="stat-value">{result.data.estimated_weight_kg} kg</div><div className="stat-label">Est. Weight</div></div>
              </div>
              <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.875rem' }}>Device Triage Results</h4>
              {(result.data.devices || []).map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <span>{d.name} × {d.quantity}</span>
                  <span className={`badge ${d.triage_class?.includes('hazardous') ? 'badge-red' : d.triage_class?.includes('refurb') ? 'badge-green' : 'badge-blue'}`}>
                    {d.triage_class}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

// ─── MODULE 2: Collector Matching ─────────────────────────────────────────────
function AssignButton({ collectorId, orgId, collectorName }) {
  const [status, setStatus] = useState('idle')
  const [msg, setMsg]       = useState('')

  const handleAssign = async () => {
    setStatus('loading')
    try {
      const batchesRes = await api.getOrgBatches(orgId)
      const pending = (batchesRes.batches || []).filter(b => b.status === 'pending')
      if (!pending.length) {
        setMsg('No batch is waiting for collection. Add equipment and prepare a batch first.')
        setStatus('error'); return
      }
      await api.assignBatch(pending[0].id, collectorId)
      setMsg(`Batch ${pending[0].batch_uid} assigned. You can follow its progress in the compliance dashboard.`)
      setStatus('done')
    } catch(e) { setMsg(`❌ ${e.message}`); setStatus('error') }
  }

  if (status === 'done') return (
    <div style={{ fontSize: '0.72rem', color: 'var(--green-400)', maxWidth: 190, textAlign: 'right', lineHeight: 1.4 }}>{msg}</div>
  )
  return (
    <div style={{ textAlign: 'right' }}>
      <button className="btn btn-primary btn-sm" id={`assign-col-${collectorId}`}
        onClick={handleAssign} disabled={status === 'loading'}>
        {status === 'loading' ? 'Assigning…' : 'Assign to My Batch →'}
      </button>
      {status === 'error' && <div style={{ fontSize: '0.7rem', color: 'var(--rose-500)', marginTop: 4, maxWidth: 170 }}>{msg}</div>}
    </div>
  )
}

function Module2({ activeBatch }) {
  const [orgs, setOrgs]       = useState([])
  const [orgId, setOrgId]     = useState(activeBatch?.orgId || 1)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { api.getOrgs().then(d => setOrgs(d.organisations || [])) }, [])

  useEffect(() => {
    if (!activeBatch?.orgId) return
    setOrgId(activeBatch.orgId)
    api.matchCollectors(activeBatch.orgId).then(setResult).catch(e => alert(e.message))
  }, [activeBatch?.orgId])

  const doFetch = async () => {
    setLoading(true)
    try { setResult(await api.matchCollectors(orgId)) }
    catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Arrange collection</h2>
      <p className="section-sub">
        Compare nearby collection providers and choose the best fit for your organisation.
      </p>

      {activeBatch?.org && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Choose a nearby provider for pickup</h3>
          <p className="section-sub">Batch {activeBatch.batch_uid} · {activeBatch.org.name} · {activeBatch.org.city}</p>
          <CollectorMap
            orgLat={activeBatch.org.lat}
            orgLng={activeBatch.org.lng}
            orgName={activeBatch.org.name}
            orgCity={activeBatch.org.city}
            batchId={activeBatch.batch_id}
            batchUid={activeBatch.batch_uid}
          />
        </section>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 320, marginBottom: 0 }}>
          <label className="form-label">Select Organisation</label>
          <select className="form-input form-select" value={orgId} onChange={e => setOrgId(Number(e.target.value))}>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" id="match-collectors-btn" onClick={doFetch} disabled={loading}>
          {loading ? 'Matching…' : 'Find Best Collectors'}
        </button>
      </div>

      {result && (
        <div className="anim-fade-in">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <span className="badge badge-amber">Pending weight: {result.pending_weight_kg} kg</span>
            <span className="badge badge-blue">{result.org_city}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.recommended_collectors.map((c, i) => (
              <div className="entity-card" key={c.id}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    {i === 0 && <span className="badge badge-green">Best Match</span>}
                    <div className="entity-name">{c.name}</div>
                  </div>
                  <div className="entity-meta">{c.city} · {c.address}</div>
                  <div className="entity-meta mono" style={{ marginTop: 2 }}>{c.registration_number}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-teal">Capacity: {c.weekly_capacity_kg} kg/wk</span>
                    <span className="badge badge-blue">Radius: {c.service_radius_km} km</span>
                    <span className="badge badge-amber">~{c.distance_approx} km away</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <div className="entity-score">
                    <div className="entity-score-val">{c.match_score}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Match Score</div>
                    <div className="rating-stars" style={{ marginTop: 4 }}>{'★'.repeat(Math.round(c.rating))}</div>
                  </div>
                  <AssignButton collectorId={c.id} orgId={orgId} collectorName={c.name} />
                </div>
              </div>
            ))}
          </div>
          {!result.recommended_collectors.length && (
            <div className="empty-state"><p>No collection providers found for this organisation.</p></div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MODULE 3: EPR Dashboard ──────────────────────────────────────────────────
function ComplianceRing({ pct }) {
  const r = 56, circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width="140" height="140" className="ring-svg">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#grd)" strokeWidth="12"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <defs><linearGradient id="grd" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#14b8a6"/></linearGradient></defs>
      <text x="70" y="65" textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="800">{pct}%</text>
      <text x="70" y="84" textAnchor="middle" fill="#94a3b8" fontSize="10">Compliance</text>
    </svg>
  )
}

function Module3() {
  const [orgs, setOrgs]     = useState([])
  const [orgId, setOrgId]   = useState(1)
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getOrgs().then(d => setOrgs(d.organisations || []))
    fetchDashboard(1)
  }, [])

  const fetchDashboard = async (id) => {
    setLoading(true)
    try { setData(await api.getEprDashboard(id)) }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="loading-wrap"><div className="loader" /></div>

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Compliance overview</h2>
      <p className="section-sub">Review your annual obligation, certified weight, and environmental impact.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 320, marginBottom: 0 }}>
          <label className="form-label">Select Organisation</label>
          <select className="form-input form-select" value={orgId}
            onChange={e => { setOrgId(Number(e.target.value)); fetchDashboard(Number(e.target.value)) }}>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      </div>

      {data && (
        <div className="anim-fade-in">
          <div className="grid-4 mb-4" style={{ marginBottom: 24 }}>
            <div className="card stat-card"><div className="stat-value">{data.compliance_pct}%</div><div className="stat-label">EPR Compliance</div></div>
            <div className="card stat-card"><div className="stat-value">{data.certified_weight_kg} kg</div><div className="stat-label">Certified Weight</div></div>
            <div className="card stat-card"><div className="stat-value">{data.obligation_kg} kg</div><div className="stat-label">Annual Obligation</div></div>
            <div className="card stat-card"><div className="stat-value">{data.co2_avoided_kg} kg</div><div className="stat-label">CO₂ Avoided</div></div>
          </div>

          <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
            {/* Compliance Ring */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <h3 style={{ fontWeight: 700, alignSelf: 'flex-start' }}>Compliance Meter</h3>
              <ComplianceRing pct={data.compliance_pct} />
              <div className="progress-track w-full">
                <div className="progress-fill" style={{ width: `${data.compliance_pct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span>0 kg</span><span>{data.obligation_kg} kg obligation</span>
              </div>
            </div>

            {/* Batch Status Timeline */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Batch Status</h3>
              <div className="timeline">
                {(data.batches || []).slice(0, 5).map(b => (
                  <div className="timeline-item" key={b.id}>
                    <div className={`timeline-dot ${b.status === 'certified' ? 'done' : b.status === 'pending' ? 'empty' : 'active'}`} />
                    <div className="timeline-body">
                      <div className="timeline-title mono">{b.batch_uid}</div>
                      <div style={{ marginTop: 4 }}><StatusBadge status={b.status} /></div>
                      <div className="timeline-date">{b.estimated_weight_kg} kg · {b.total_devices} devices</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certificates Table */}
          {data.certificates?.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>EPR certificates</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Certificate UID</th><th>Weight (kg)</th><th>CO₂ Avoided</th><th>Copper (kg)</th><th>Gold (g)</th><th>Issued</th></tr></thead>
                  <tbody>
                    {data.certificates.map(c => (
                      <tr key={c.id}>
                        <td><span className="mono green">{c.certificate_uid}</span></td>
                        <td>{c.weight_kg}</td>
                        <td>{c.co2_avoided_kg} kg</td>
                        <td>{c.copper_recovered_kg}</td>
                        <td>{c.gold_recovered_g}</td>
                        <td className="muted">{c.issued_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Portal Wrapper ───────────────────────────────────────────────────────────
const MODULES = [
  { id: 0, label: 'Organisation', component: Module0 },
  { id: 1, label: 'Equipment', component: Module1 },
  { id: 2, label: 'Collection', component: Module2 },
  { id: 3, label: 'Compliance', component: Module3 },
]

export default function BulkConsumerPortal() {
  const [active, setActive] = useState(0)
  const [activeBatch, setActiveBatch] = useState(null)
  const ActiveComp = MODULES[active].component

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div>
          <div style={{ padding: '12px 12px 4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Bulk consumer
          </div>
          {MODULES.map(m => (
            <button key={m.id} className={`sidebar-btn ${active === m.id ? 'active' : ''}`} onClick={() => setActive(m.id)}>
              <span className="sidebar-icon">0{m.id + 1}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: '12px 0 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>E-Waste Rules 2022</div>
        </div>
      </aside>

      <main className="portal-content">
        <PipelineBar activeStep={active} />
        <EnvImpactCounter />
        <ActiveComp setActiveModule={setActive} onBatchCreated={setActiveBatch} activeBatch={activeBatch} />
      </main>
    </div>
  )
}
