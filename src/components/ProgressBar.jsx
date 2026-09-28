/**
 * ProgressBar — Step indicator shown across all screens
 *
 * Props:
 *   currentStep — The active step number (0-indexed)
 *   steps       — Array of step label strings
 *
 * Note: currentStep is 0-based (0 = first step, 1 = second, etc.)
 * Steps before the current one are marked "completed", the current is "active".
 */

import { Check } from 'lucide-react'

function ProgressBar({ currentStep, steps }) {
  return (
    <nav className="progress-bar" aria-label="Progress">
      <div className="progress-bar-inner">
        <ol className="progress-steps">
          {steps.map((label, index) => {
            // Determine if this step is completed, active, or upcoming
            const isCompleted = index < currentStep
            const isActive = index === currentStep

            const stepClass = [
              'progress-step',
              isCompleted ? 'completed' : '',
              isActive ? 'active' : ''
            ].filter(Boolean).join(' ')

            return (
              <li key={label} className={stepClass}>
                {/* Circle: show checkmark for completed, number for others */}
                <span className="progress-step-circle" aria-hidden="true">
                  {isCompleted ? <Check size={14} /> : index + 1}
                </span>
                <span className="progress-step-label">{label}</span>
                {/* Screen reader text */}
                <span className="sr-only">
                  Step {index + 1}: {label}
                  {isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export default ProgressBar
