/**
 * WorkplaceConcernScreen — Select the workplace concern
 *
 * Props received from App.jsx:
 *   concern     — Currently selected concern id (string)
 *   setConcern  — Function to update the selected concern
 *   onContinue  — Function to advance to the next screen
 *   onBack      — Function to go back to the previous screen
 */

import { useState } from 'react'
import { DollarSign, Coffee, CalendarClock, Receipt, HelpCircle, MessageCircleQuestion } from 'lucide-react'
import concernOptions from '../data/concernOptions'
import NavigationFooter from '../components/NavigationFooter'
import { ChoiceboxGroup } from '../components/ui/choicebox'

// Map concern ids to Lucide icons
const concernIcons = {
  'unpaid-work': DollarSign,
  'missed-breaks': Coffee,
  'roster-changes': CalendarClock,
  'pay-uncertainty': Receipt,
  'other': HelpCircle
}

function WorkplaceConcernScreen({ concern, setConcern, onContinue, onBack }) {
  const [error, setError] = useState('')

  const handleContinue = () => {
    if (!concern) {
      setError('Please select a concern before continuing.')
      return
    }
    onContinue()
  }

  return (
    <div className="screen">
      {/* Screen header */}
      <div className="screen-header">
        <div className="screen-header-icon">
          <MessageCircleQuestion size={28} />
        </div>
        <h1 className="screen-title">What Is Your Concern?</h1>
        <p className="screen-subtitle">
          Select the situation that best matches your experience.
          You can always go back and change this.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="login-error" style={{ marginBottom: '1rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Concern selection using ChoiceboxGroup (21st.dev pattern) */}
      <ChoiceboxGroup
        direction="column"
        type="radio"
        value={concern}
        onChange={(val) => {
          setConcern(val)
          if (error) setError('')
        }}
      >
        {concernOptions.map((option) => {
          const IconComponent = concernIcons[option.id] || HelpCircle
          return (
            <ChoiceboxGroup.Item
              key={option.id}
              title={option.title}
              description={option.description}
              value={option.id}
            >
              <IconComponent size={22} />
            </ChoiceboxGroup.Item>
          )
        })}
      </ChoiceboxGroup>

      {/* Navigation */}
      <NavigationFooter
        onBack={onBack}
        onContinue={handleContinue}
        continueDisabled={!concern}
      />
    </div>
  )
}

export default WorkplaceConcernScreen
