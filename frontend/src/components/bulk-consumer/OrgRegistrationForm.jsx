import React, { useState } from 'react'
import { bulkConsumerAPI } from '../../utils/api'
import { validateGST } from '../../utils/helpers'

export default function OrgRegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    gst_number: '',
    org_type: 'company',
    address: '',
    city: '',
    lat: 0,
    lng: 0,
    employee_count: 0
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
    
    if (!validateGST(formData.gst_number)) {
      setError('Invalid GST number')
      return
    }

    try {
      const response = await bulkConsumerAPI.register(formData)
      setMessage(`Organisation registered successfully! ID: ${response.data.org_id}`)
      setFormData({
        name: '',
        gst_number: '',
        org_type: 'company',
        address: '',
        city: '',
        lat: 0,
        lng: 0,
        employee_count: 0
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Register Organization</h2>
      
      {message && <div className="bg-green-100 text-green-800 p-4 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Organization Name</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="form-label">GST Number</label>
            <input type="text" name="gst_number" className="form-input" value={formData.gst_number} onChange={handleChange} required />
          </div>
          
          <div>
            <label className="form-label">Organization Type</label>
            <select name="org_type" className="form-input" value={formData.org_type} onChange={handleChange}>
              <option value="company">Company</option>
              <option value="hospital">Hospital</option>
              <option value="college">College</option>
              <option value="rwa">RWA</option>
              <option value="small_business">Small Business</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">City</label>
            <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} required />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Address</label>
          <textarea name="address" className="form-input" rows="3" value={formData.address} onChange={handleChange} required />
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
            <label className="form-label">Employee Count</label>
            <input type="number" name="employee_count" className="form-input" value={formData.employee_count} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary mt-6">Register Organization</button>
      </form>
    </div>
  )
}
