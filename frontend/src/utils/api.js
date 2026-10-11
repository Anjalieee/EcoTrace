const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(method, path, body = null) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (body) opts.body = JSON.stringify(body)
    const res = await fetch(`${API_BASE}${path}`, opts)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network error' }))
      throw new Error(err.detail || `HTTP ${res.status}`)
    }
    return res.json()
  } catch (e) {
    console.error(`API ${method} ${path}:`, e.message)
    throw e
  }
}

export const api = {
  // ── Dashboard ──────────────────────────────────
  getDashboard:      ()         => request('GET',  '/data/dashboard'),
  getAllBatches:      ()         => request('GET',  '/data/batches'),
  getAllCerts:        ()         => request('GET',  '/data/certificates'),
  getAllCollectors:   ()         => request('GET',  '/data/collectors'),
  getAllRecyclers:    ()         => request('GET',  '/data/recyclers'),
  getAllDevices:      ()         => request('GET',  '/data/devices'),

  // ── Bulk Consumer ──────────────────────────────
  getOrgs:           ()         => request('GET',  '/bulk-consumer/orgs'),
  getOrgsByCity:     (city)     => request('GET',  `/bulk-consumer/orgs/${city}`),
  registerOrg:       (data)     => request('POST', '/bulk-consumer/register', data),
  getDevices:        ()         => request('GET',  '/bulk-consumer/devices'),
  createBatch:       (data)     => request('POST', '/bulk-consumer/batch/create', data),
  getBatch:          (id)       => request('GET',  `/bulk-consumer/batch/${id}`),
  getOrgBatches:     (orgId)    => request('GET',  `/bulk-consumer/org/${orgId}/batches`),
  matchCollectors:   (orgId)    => request('GET',  `/bulk-consumer/match-collectors/${orgId}`),
  getNearbyCollectors: (params) => request('GET', `/bulk-consumer/nearby-collectors?${new URLSearchParams(params)}`),
  getNearbyRecyclers:  (params) => request('GET', `/bulk-consumer/nearby-recyclers?${new URLSearchParams(params)}`),
  requestPickup: (batchId, providerType, providerId) => request('POST', `/bulk-consumer/batch/${batchId}/pickup-request`, { provider_type: providerType, provider_id: providerId }),
  getEprDashboard:   (orgId)    => request('GET',  `/bulk-consumer/epr-dashboard/${orgId}`),

  // ── Collector ──────────────────────────────────
  getAllCollectorsPortal: ()      => request('GET',  '/collector/all'),
  registerCollector:  (data)     => request('POST', '/collector/register', data),
  getCollectorFeed:   (id)       => request('GET',  `/collector/${id}/feed`),
  getDrivePlan:       (id)       => request('GET',  `/collector/${id}/drive-plan`),
  getAssigned:        (id)       => request('GET',  `/collector/${id}/assigned`),
  assignBatch:        (bId, cId) => request('PATCH',`/collector/batch/${bId}/assign?collector_id=${cId}`),
  collectBatch:       (bId)      => request('PATCH',`/collector/batch/${bId}/collect`),
  getColCerts:        (id)       => request('GET',  `/collector/${id}/certificates`),

  // ── Recycler ───────────────────────────────────
  getAllRecyclersPortal: ()       => request('GET',  '/recycler/all'),
  registerRecycler:   (data)     => request('POST', '/recycler/register', data),
  getReceivedBatches: (id)       => request('GET',  `/recycler/${id}/received`),
  receiveBatch:       (bId, rId) => request('PATCH',`/recycler/batch/${bId}/receive?recycler_id=${rId}`),
  getNetworkOverview: ()         => request('GET',  '/recycler/network/overview'),
  issueCert:          (data)     => request('POST', '/recycler/certificate/issue', data),
  getRecyclerImpact:  (id)       => request('GET',  `/recycler/${id}/impact`),
  getAllCertsRecycler: ()        => request('GET',  '/recycler/certificates/all'),
  searchCert:         (prefix)   => request('GET',  `/recycler/certificate/search/${prefix}`),
}
