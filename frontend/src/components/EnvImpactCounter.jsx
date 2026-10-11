import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'

const FALLBACK = {
  total_weight_kg:        1382,
  total_devices_recycled: 1358,
  co2_avoided_kg:         6075,
  copper_recovered_kg:    30.3,
  gold_recovered_g:       31.4,
  certificates_issued:    6,
  batches_total:          10,
  orgs_registered:        8,
  collectors_active:      5,
  recyclers_active:       5,
}

function AnimCount({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = Number(value)
    if (end === 0) return
    const step = Math.max(1, Math.floor(end / 40))
    const timer = setInterval(() => {
      start = Math.min(start + step, end)
      setDisplay(start)
      if (start >= end) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display.toLocaleString()}{suffix}</>
}

export default function EnvImpactCounter() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.getDashboard()
      .then(d => setData(d.impact))
      .catch(() => setData(FALLBACK))
  }, [])

  const d = data || FALLBACK

  return (
    <div className="impact-strip anim-fade-in">
      <div className="impact-item">
        <span className="impact-icon" aria-hidden="true">01</span>
        <div>
          <div className="impact-val"><AnimCount value={d.total_weight_kg} /> kg</div>
          <div className="impact-lab">E-waste processed</div>
        </div>
      </div>
      <div className="impact-item">
        <span className="impact-icon" aria-hidden="true">02</span>
        <div>
          <div className="impact-val"><AnimCount value={d.co2_avoided_kg} /> kg</div>
          <div className="impact-lab">CO₂ avoided</div>
        </div>
      </div>
      <div className="impact-item">
        <span className="impact-icon" aria-hidden="true">03</span>
        <div>
          <div className="impact-val"><AnimCount value={d.copper_recovered_kg} /> kg</div>
          <div className="impact-lab">Copper recovered</div>
        </div>
      </div>
      <div className="impact-item">
        <span className="impact-icon" aria-hidden="true">04</span>
        <div>
          <div className="impact-val"><AnimCount value={d.gold_recovered_g} /> g</div>
          <div className="impact-lab">Gold recovered</div>
        </div>
      </div>
      <div className="impact-item">
        <span className="impact-icon" aria-hidden="true">05</span>
        <div>
          <div className="impact-val"><AnimCount value={d.certificates_issued} /></div>
          <div className="impact-lab">EPR certificates</div>
        </div>
      </div>
      <div className="impact-item">
        <span className="impact-icon" aria-hidden="true">06</span>
        <div>
          <div className="impact-val"><AnimCount value={d.orgs_registered} /></div>
          <div className="impact-lab">Orgs registered</div>
        </div>
      </div>
    </div>
  )
}
