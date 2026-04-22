import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import BulkConsumerPortal from './pages/BulkConsumerPortal'
import CollectorPortal from './pages/CollectorPortal'
import RecyclerPortal from './pages/RecyclerPortal'

function App() {
  return (
    <Router>
      <Routes>
        {/* Login / role-select — no navbar */}
        <Route path="/" element={<LoginPage />} />

        {/* Portals — with navbar */}
        <Route path="/home" element={<><Navbar /><div className="page-wrapper"><HomePage /></div></>} />
        <Route path="/bulk-consumer/*" element={<><Navbar /><div className="page-wrapper"><BulkConsumerPortal /></div></>} />
        <Route path="/collector/*"     element={<><Navbar /><div className="page-wrapper"><CollectorPortal /></div></>} />
        <Route path="/recycler/*"      element={<><Navbar /><div className="page-wrapper"><RecyclerPortal /></div></>} />
      </Routes>
    </Router>
  )
}

export default App
