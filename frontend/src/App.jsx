import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

// Pages (to be created)
// import BulkConsumerPortal from './pages/BulkConsumerPortal'
// import CollectorPortal from './pages/CollectorPortal'
// import RecyclerPortal from './pages/RecyclerPortal'
// import HomePage from './pages/HomePage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-green-600">EcoTrace</h1>
            <p className="text-gray-600 text-sm">E-Waste Management & EPR Tracking System</p>
          </div>
        </nav>

        <Routes>
          {/* <Route path="/" element={<HomePage />} />
          <Route path="/bulk-consumer/*" element={<BulkConsumerPortal />} />
          <Route path="/collector/*" element={<CollectorPortal />} />
          <Route path="/recycler/*" element={<RecyclerPortal />} /> */}
          <Route path="/" element={<div className="text-center py-10">
            <h2 className="text-3xl font-bold">Welcome to EcoTrace</h2>
            <p className="text-gray-600 mt-4">Sustainable E-Waste Management System</p>
          </div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
