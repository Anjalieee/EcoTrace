import React, { useState } from 'react'
import { collectorAPI } from '../../utils/api'

export default function CollectorRegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    address: '',
    city: '',
    lat: 0,
    lng: 0,
    service_radius_km: 10,
    min_batch_kg: 0,
    weekly_capacity_kg: 500,
    accepted_types: []
  })
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await collectorAPI.register(formData)
      setMessage(`Collector registered successfully! ID: ${response.data.collector_id}`)
      setFormData({
        name: '',
        registration_number: '',
        address: '',
        city: '',
        lat: 0,
        lng: 0,
        service_radius_km: 10,
        min_batch_kg: 0,
        weekly_capacity_kg: 500,
        accepted_types: []
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Register Collector (PRO)</h2>
      
      {message && <div className="bg-green-100 text-green-800 p-4 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Collector Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="form-label">Registration Number</label>
            <input type="text" name="registration_number" className="form-input" value={formData.registration_number} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="form-label">City</label>
            <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="form-label">Service Radius (km)</label>
            <input type="number" name="service_radius_km" step="0.1" className="form-input" value={formData.service_radius_km} onChange={handleChange} />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Address</label>
          <textarea name="address" className="form-input" rows="2" value={formData.address} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className="form-label">Latitude</label>
            <input type="number" name="lat" step="0.0001" className="form-input" value={formData.lat} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">Longitude</label>
            <input type="number" name="lng" step="0.0001" className="form-input" value={formData.lng} onChange={handleChange} />
          </div>
          <div>
            <label className="form-label">Weekly Capacity (kg)</label>
            <input type="number" name="weekly_capacity_kg" step="1" className="form-input" value={formData.weekly_capacity_kg} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary mt-6">Register Collector</button>
      </form>
    </div>
  )
}
