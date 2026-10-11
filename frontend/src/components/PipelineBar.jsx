import React from 'react'

const STEPS = [
  { id: 0, label: 'Registration' },
  { id: 1, label: 'Device review' },
  { id: 2, label: 'Collection' },
  { id: 3, label: 'Impact & certificates' },
]

/**
 * Displays progress through the four workflow steps.
 * @param {number} activeStep  — 0..3 currently active module
 */
export default function PipelineBar({ activeStep = 0 }) {
  return (
    <div className="pipeline-bar">
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 12, whiteSpace: 'nowrap', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Workflow
      </span>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className={`pipeline-step ${i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending'}`}>
            <span className="pipeline-step-icon">{s.id + 1}</span>
            <span>{s.label}</span>
            {i < activeStep && <span className="workflow-check" aria-label="Complete">✓</span>}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`pipeline-connector ${i < activeStep ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
