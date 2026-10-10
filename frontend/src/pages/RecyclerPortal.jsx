import React, { useState, useEffect } from 'react'
import PipelineBar from '../components/PipelineBar'
import EnvImpactCounter from '../components/EnvImpactCounter'
import { api } from '../utils/api'

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
  const [recyclers, setRecyclers] = useState([])
  const [loading, setLoading]    = useState(true)
  const [form, setForm] = useState({ name: '', registration_number: '', address: '', city: 'Noida', specialisation: 'IT Equipment', weekly_capacity_kg: 2000 })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.getAllRecyclersPortal().then(d => setRecyclers(d.recyclers || [])).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await api.registerRecycler({ ...form, lat: 28.53, lng: 77.39, accepted_types: ['IT Equipment'] })
      setMsg(` Recycler registered! ID: ${res.recycler_id}`)
      const d = await api.getAllRecyclersPortal()
      setRecyclers(d.recyclers || [])
    } catch(e) { setMsg(`❌ ${e.message}`) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Module 0 · Registry &amp; Capacity</h2>
      <p className="section-sub">Register as a CPCB-certified recycler. Your capacity and recovery rates are visible to the entire network.</p>

      <div className="grid-2" style={{ gap: 24 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register Recycler Facility</h3>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Facility Name',         key: 'name',                placeholder: 'Attero Recycling Pvt Ltd' },
              { label: 'CPCB Registration No',  key: 'registration_number', placeholder: 'CPCB-REC-2024-001' },
              { label: 'Address',               key: 'address',             placeholder: 'Sector 135, Noida' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
              </div>
            ))}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-input form-select" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                  {['Delhi','Mumbai','Bengaluru','Hyderabad','Noida','Pune','Chennai'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Specialisation</label>
                <select className="form-input form-select" value={form.specialisation} onChange={e => setForm(p => ({ ...p, specialisation: e.target.value }))}>
                  {['IT Equipment','Batteries','Large Appliances','Consumer Electronics','Mixed'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Weekly Capacity (kg)</label>
              <input className="form-input" type="number" value={form.weekly_capacity_kg}
                onChange={e => setForm(p => ({ ...p, weekly_capacity_kg: Number(e.target.value) }))} />
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.startsWith('') ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', color: msg.startsWith('') ? 'var(--green-400)' : 'var(--rose-500)', fontSize: '0.87rem', marginBottom: 12 }}>{msg}</div>}
            <button className="btn btn-primary w-full" type="submit">Register Facility</button>
          </form>
        </div>

        <div className="card" style={{ overflowY: 'auto', maxHeight: 520 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>CPCB-Certified Recyclers <span className="badge badge-green">{recyclers.length}</span></h3>
          {loading ? <div className="loading-wrap"><div className="loader" /></div> :
            recyclers.map(r => (
              <div className="card card-sm" key={r.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{r.name}</div>
                    <div className="entity-meta">{r.registration_number}</div>
                    <div className="entity-meta">{r.city} · {r.specialisation}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-400)' }}>{r.recovery_rate_pct}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recovery rate</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-teal">{r.weekly_capacity_kg} kg/wk</span>
                  <span className="badge badge-green">CO₂: {r.co2_avoided_total_kg.toLocaleString()} kg saved</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Capacity utilised</div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.random() * 70 + 20}%` }} /></div>
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
  const [recyclers, setRecyclers] = useState([])
  const [recId, setRecId]   = useState(1)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { api.getAllRecyclersPortal().then(d => setRecyclers(d.recyclers || [])) }, [])

  const fetchBatches = async (id) => {
    setLoading(true)
    try {
      const d = await api.getReceivedBatches(id)
      setBatches(d.batches || [])
    } catch(e) { alert(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBatches(1) }, [])

  const handleReceive = async (bId) => {
    try {
      await api.receiveBatch(bId, recId)
      setMsg(' Batch marked as received at recycler!')
      fetchBatches(recId)
    } catch(e) { setMsg(`❌ ${e.message}`) }
  }

  const allBatches = batches

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Module 1 · Incoming Batch Feed</h2>
      <p className="section-sub">View all batches arriving at this recycling facility. Confirm receipt and begin processing.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 320, marginBottom: 0 }}>
          <label className="form-label">Select Recycler</label>
          <select className="form-input form-select" value={recId}
            onChange={e => { setRecId(Number(e.target.value)); fetchBatches(Number(e.target.value)) }}>
            {recyclers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.startsWith('') ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', color: msg.startsWith('') ? 'var(--green-400)' : 'var(--rose-500)', fontSize: '0.87rem', marginBottom: 16 }}>{msg}</div>}

      {loading ? <div className="loading-wrap"><div className="loader" /></div> : (
        !allBatches.length ? (
          <div className="empty-state"><div className="empty-state-icon">📭</div><p>No batches received at this facility yet</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Batch UID</th><th>Org</th><th>Collector</th><th>Weight</th><th>Devices</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {allBatches.map(b => (
                  <tr key={b.id}>
                    <td><span className="mono green">{b.batch_uid}</span></td>
                    <td>{b.org_name || `Org #${b.org_id}`}</td>
                    <td>{b.collector_name || `Col #${b.collector_id}`}</td>
                    <td>{b.estimated_weight_kg} kg</td>
                    <td>{b.total_devices}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      {b.status === 'collected' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleReceive(b.id)}>Receive</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

// ─── MODULE 2: Network View ────────────────────────────────────────────────────
function Module2() {
  const [network, setNetwork] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getNetworkOverview().then(setNetwork).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-wrap"><div className="loader" /></div>

  const collectors = network?.nodes?.filter(n => n.type === 'collector') || []
  const recyclers  = network?.nodes?.filter(n => n.type === 'recycler')  || []

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Module 2 · Network View</h2>
      <p className="section-sub">Full collector → recycler network graph. Shows all active connections and batch flows.</p>

      {network && (
        <div className="grid-3 mb-4" style={{ gap: 16, marginBottom: 24 }}>
          <div className="card stat-card"><div className="stat-value">{network.stats.total_collectors}</div><div className="stat-label">Active Collectors</div></div>
          <div className="card stat-card"><div className="stat-value">{network.stats.total_recyclers}</div><div className="stat-label">Certified Recyclers</div></div>
          <div className="card stat-card"><div className="stat-value">{network.stats.total_connections}</div><div className="stat-label">Network Connections</div></div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Collectors column */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🚛 Collectors <span className="badge badge-blue">{collectors.length}</span></h3>
          {collectors.map(c => (
            <div className="card card-sm" key={c.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{c.name}</div>
                  <div className="entity-meta">{c.city}</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="badge badge-amber" style={{ marginRight: 6 }}>{c.batches} batches</span>
                    <span className="badge badge-teal">{'★'.repeat(Math.round(c.rating || 4))} {c.rating}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {c.lat?.toFixed(4)}, {c.lng?.toFixed(4)}
                </div>
              </div>
              {/* Connection arrows */}
              {(network?.edges || []).filter(e => e.from === c.id).map((e, i) => {
                const rec = recyclers.find(r => r.id === e.to)
                return rec ? (
                  <div key={i} style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--green-400)' }}>→</span>
                    <span>{rec.name}</span>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>{e.weight_kg} kg</span>
                  </div>
                ) : null
              })}
            </div>
          ))}
        </div>

        {/* Recyclers column */}
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>♻️ Recyclers <span className="badge badge-purple">{recyclers.length}</span></h3>
          {recyclers.map(r => (
            <div className="card card-sm" key={r.id} style={{ marginBottom: 10, borderColor: 'rgba(192,132,252,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{r.name}</div>
                  <div className="entity-meta">{r.city} · {r.capacity_kg?.toLocaleString()} kg/wk</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--purple-400)' }}>{r.recovery_rate}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recovery</div>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="progress-track"><div className="progress-fill progress-fill-blue" style={{ width: `${r.recovery_rate}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge list*/}
      {network?.edges?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>All Batch Flows (Graph Edges)</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>From (Collector)</th><th>To (Recycler)</th><th>Batch UID</th><th>Weight</th><th>Status</th></tr></thead>
              <tbody>
                {network.edges.map((e, i) => {
                  const col = collectors.find(c => c.id === e.from)
                  const rec = recyclers.find(r => r.id === e.to)
                  return (
                    <tr key={i}>
                      <td>{col?.name || e.from}</td>
                      <td>{rec?.name || e.to}</td>
                      <td><span className="mono">{e.batch_uid}</span></td>
                      <td>{e.weight_kg} kg</td>
                      <td><span className={`badge ${e.status === 'certified' ? 'badge-green' : 'badge-blue'}`}>{e.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MODULE 3: Certificate Issuance & Impact ──────────────────────────────────
function Module3() {
  const [recyclers, setRecyclers] = useState([])
  const [recId, setRecId]   = useState(1)
  const [impact, setImpact] = useState(null)
  const [allCerts, setAllCerts] = useState([])
  const [searchPrefix, setSearchPrefix] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading]  = useState(false)
  const [form, setForm] = useState({ batch_id: 3, org_id: 3, collector_id: 3, recycler_id: 3, weight_kg: 390, copper_recovered_kg: 6.5, gold_recovered_g: 4.2, devices_refurbished: 25, co2_avoided_kg: 1950 })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.getAllRecyclersPortal().then(d => setRecyclers(d.recyclers || []))
    fetchImpact(1)
    api.getAllCertsRecycler().then(d => setAllCerts(d.certificates || []))
  }, [])

  const fetchImpact = async (id) => {
    setLoading(true)
    try { setImpact(await api.getRecyclerImpact(id)) }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleIssueCert = async e => {
    e.preventDefault()
    try {
      const res = await api.issueCert({ ...form, recycler_id: recId })
      setMsg(` Certificate issued! UID: ${res.certificate_uid}`)
      fetchImpact(recId)
      api.getAllCertsRecycler().then(d => setAllCerts(d.certificates || []))
    } catch(e) { setMsg(`❌ ${e.message}`) }
  }

  const handleSearch = async () => {
    if (!searchPrefix.trim()) return
    try {
      const res = await api.searchCert(searchPrefix)
      setSearchResults(res.results || [])
    } catch(e) { alert(e.message) }
  }

  return (
    <div className="anim-fade-up">
      <h2 className="section-title">Module 3 · Certificate Issuance &amp; Impact</h2>
      <p className="section-sub">Issue EPR certificates for processed batches. Trie enables O(m) certificate UID prefix search.</p>
      <div className="dsa-tag mb-4">⚙️ DSA: Trie — O(m) prefix search across all certificate UIDs stored in Trie nodes</div>

      {/* Recycler selector */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
        <div className="form-group" style={{ flex: 1, maxWidth: 320, marginBottom: 0 }}>
          <label className="form-label">Select Recycler</label>
          <select className="form-input form-select" value={recId}
            onChange={e => { setRecId(Number(e.target.value)); fetchImpact(Number(e.target.value)); setForm(p => ({...p, recycler_id: Number(e.target.value)})) }}>
            {recyclers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>

      {/* Impact stats */}
      {impact && (
        <div className="grid-4 mb-4" style={{ marginBottom: 24 }}>
          <div className="card stat-card"><div className="stat-value">{impact.certificates_issued}</div><div className="stat-label">Certs Issued</div></div>
          <div className="card stat-card"><div className="stat-value">{impact.total_weight_processed_kg} kg</div><div className="stat-label">Weight Processed</div></div>
          <div className="card stat-card"><div className="stat-value green">{impact.total_co2_avoided_kg} kg</div><div className="stat-label">CO₂ Avoided</div></div>
          <div className="card stat-card"><div className="stat-value amber">{impact.total_gold_g} g</div><div className="stat-label">Gold Recovered</div></div>
        </div>
      )}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Cert issuance form */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Issue EPR Certificate</h3>
          <form onSubmit={handleIssueCert}>
            <div className="grid-2">
              {[
                { label: 'Batch ID',             key: 'batch_id',           type: 'number' },
                { label: 'Org ID',               key: 'org_id',             type: 'number' },
                { label: 'Collector ID',         key: 'collector_id',       type: 'number' },
                { label: 'Weight (kg)',           key: 'weight_kg',          type: 'number' },
                { label: 'Copper Recovered (kg)', key: 'copper_recovered_kg', type: 'number' },
                { label: 'Gold Recovered (g)',    key: 'gold_recovered_g',   type: 'number' },
                { label: 'Devices Refurbished',  key: 'devices_refurbished', type: 'number' },
                { label: 'CO₂ Avoided (kg)',      key: 'co2_avoided_kg',     type: 'number' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))} required />
                </div>
              ))}
            </div>
            {msg && <div style={{ padding: '10px 14px', borderRadius: 8, background: msg.startsWith('') ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', color: msg.startsWith('') ? 'var(--green-400)' : 'var(--rose-500)', fontSize: '0.87rem', marginBottom: 12 }}>{msg}</div>}
            <button className="btn btn-primary w-full" type="submit">Issue Certificate</button>
          </form>
        </div>

        {/* Trie search + cert list */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🔍 Certificate Trie Search</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Enter UID prefix e.g. CERT-9A" value={searchPrefix}
                onChange={e => setSearchPrefix(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-secondary" onClick={handleSearch}>Search</button>
            </div>
            {searchResults.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {searchResults.map((c, i) => (
                  <div key={i} className="card card-sm" style={{ marginTop: 8 }}>
                    <div className="mono green">{c?.certificate_uid}</div>
                    <div className="entity-meta">{c?.weight_kg} kg · CO₂: {c?.co2_avoided_kg} kg</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ maxHeight: 340, overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>All Certificates <span className="badge badge-green">{allCerts.length}</span></h3>
            {allCerts.map(c => (
              <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                <div className="flex justify-between items-center">
                  <span className="mono green">{c.certificate_uid}</span>
                  <span className="badge badge-green">✓ Issued</span>
                </div>
                <div className="muted" style={{ marginTop: 4 }}>{c.weight_kg} kg · {c.co2_avoided_kg} kg CO₂ · Gold: {c.gold_recovered_g}g</div>
                <div className="muted">{c.issued_at}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const RECYCLER_MODULES = [
  { id: 0, icon: '🏭', label: 'Registry & Capacity',      component: Module0 },
  { id: 1, icon: '📥', label: 'Incoming Batch Feed',       component: Module1 },
  { id: 2, icon: '🌐', label: 'Network View',              component: Module2 },
  { id: 3, icon: '📜', label: 'Certificate Issuance',      component: Module3 },
]

export default function RecyclerPortal() {
  const [active, setActive] = useState(0)
  const ActiveComp = RECYCLER_MODULES[active].component

  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <div>
          <div style={{ padding: '12px 12px 4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ♻️ Recycler Portal
          </div>
          {RECYCLER_MODULES.map(m => (
            <button key={m.id} className={`sidebar-btn ${active === m.id ? 'active' : ''}`} onClick={() => setActive(m.id)}>
              <span className="sidebar-icon">{m.icon}</span>
              <span>Module {m.id} · {m.label}</span>
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
