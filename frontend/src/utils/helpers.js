/**
 * Utility functions for EcoTrace Frontend
 */

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatWeight = (kg) => {
  return `${parseFloat(kg).toFixed(2)} kg`
}

export const formatCurrency = (value) => {
  return `₹${parseFloat(value).toFixed(2)}`
}

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  // Haversine formula for distance between two coordinates
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const getStatusBadgeColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    collector_assigned: 'bg-blue-100 text-blue-800',
    collected: 'bg-indigo-100 text-indigo-800',
    at_recycler: 'bg-purple-100 text-purple-800',
    certified: 'bg-green-100 text-green-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const generateBatchId = () => {
  return `BATCH-${Math.random().toString(16).substr(2, 8).toUpperCase()}`
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validateGST = (gst) => {
  // Indian GST is 15 characters
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)
}
