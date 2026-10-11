import React from 'react'
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
      <AppRoutes />
    </Router>
  )
}

function AppRoutes() {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="route-transition">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<><Navbar /><div className="page-wrapper"><HomePage /></div></>} />
        <Route path="/bulk-consumer/*" element={<><Navbar /><div className="page-wrapper"><BulkConsumerPortal /></div></>} />
        <Route path="/collector/*" element={<><Navbar /><div className="page-wrapper"><CollectorPortal /></div></>} />
        <Route path="/recycler/*" element={<><Navbar /><div className="page-wrapper"><RecyclerPortal /></div></>} />
      </Routes>
    </div>
  )
}

export default App
