import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Bulk Consumer APIs
export const bulkConsumerAPI = {
  register: (orgData) => client.post('/bulk-consumer/register', orgData),
  getOrgsByCity: (city) => client.get(`/bulk-consumer/orgs/${city}`),
  createBatch: (batchData) => client.post('/bulk-consumer/batch/create', batchData),
  getBatch: (batchId) => client.get(`/bulk-consumer/batch/${batchId}`),
  getOrgBatches: (orgId) => client.get(`/bulk-consumer/org/${orgId}/batches`)
}

// Collector APIs
export const collectorAPI = {
  register: (collectorData) => client.post('/collector/register', collectorData),
  getAvailableCollectors: (city) => client.get(`/collector/available/${city}`),
  getCollector: (collectorId) => client.get(`/collector/${collectorId}`),
  getAssignedBatches: (collectorId) => client.get(`/collector/${collectorId}/assigned`),
  assignBatch: (batchId, collectorId) => client.patch(`/collector/batch/${batchId}/assign`, { collector_id: collectorId }),
  markCollected: (batchId) => client.patch(`/collector/batch/${batchId}/collect`)
}

// Recycler APIs
export const recyclerAPI = {
  register: (recyclerData) => client.post('/recycler/register', recyclerData),
  getRecycler: (recyclerId) => client.get(`/recycler/${recyclerId}`),
  getReceivedBatches: (recyclerId) => client.get(`/recycler/${recyclerId}/received`),
  markReceived: (batchId, recyclerId) => client.patch(`/recycler/batch/${batchId}/receive`, { recycler_id: recyclerId }),
  issueCertificate: (certData) => client.post('/recycler/certificate/issue', certData),
  getCertificate: (certId) => client.get(`/recycler/certificate/${certId}`)
}

export default client
