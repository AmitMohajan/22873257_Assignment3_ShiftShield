/**
 * SituationDetailsScreen — Dynamic follow-up questions based on selected concern
 *
 * Props received from App.jsx:
 *   concern           — The selected concern id (string), determines which questions to show
 *   situationDetails  — Object with answers keyed by question key
 *   setSituationDetails — Function to update situationDetails
 *   onContinue        — Function to advance to the next screen
 *   onBack            — Function to go back to the previous screen
 */

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { detailQuestions } from '../data/snapshotRules'
import FormInput from '../components/FormInput'
import FormSection from '../components/FormSection'
import NavigationFooter from '../components/NavigationFooter'

function SituationDetailsScreen({ concern, situationDetails, setSituationDetails, onContinue, onBack }) {
  const [errors, setErrors] = useState({})

  // Get the questions for the selected concern
  const questions = detailQuestions[concern] || []

  // Get a human-readable concern title for the header
  const concernTitles = {
    'unpaid-work': 'Unpaid Additional Work',
    'missed-breaks': 'Missed or Shortened Breaks',
    'roster-changes': 'Unexpected Roster Changes',
    'pay-uncertainty': 'Pay Uncertainty or Discrepancies',
    'other': 'Other Concern'
  }

  // Update a field in situationDetails
  const updateField = (key, value) => {
    setSituationDetails({ ...situationDetails, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  // Validate required fields
  const handleContinue = () => {
    const newErrors = {}
    questions.forEach((q) => {
      // Only validate non-textarea fields (textarea is optional for "other")
      if (q.type !== 'textarea' && !situationDetails[q.key]) {
        newErrors[q.key] = `Please answer: "${q.label}"`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onContinue()
  }

  return (
    <div className="screen">
      {/* Screen header */}
      <div className="screen-header">
        <div className="screen-header-icon">
          <ClipboardList size={28} />
        </div>
        <h1 className="screen-title">Tell Us More</h1>
        <p className="screen-subtitle">
          These questions help us give you a more useful snapshot about your{' '}
          <strong>{concernTitles[concern] || 'concern'}</strong>.
        </p>
      </div>

      {/* Dynamic questions */}
      <FormSection
        title="About Your Situation"
        description="Answer each question as accurately as you can. If you're unsure, pick the closest option."
      >
        {questions.map((question) => (
          <FormInput
            key={question.key}
            label={question.label}
            type={question.type}
            value={situationDetails[question.key] || ''}
            onChange={(val) => updateField(question.key, val)}
            options={question.options}
            placeholder={question.placeholder}
            helperText={question.helperText}
            error={errors[question.key]}
            maxLength={question.maxLength}
          />
        ))}
      </FormSection>

      {/* Navigation */}
      <NavigationFooter
        onBack={onBack}
        onContinue={handleContinue}
      />
    </div>
  )
}

export default SituationDetailsScreen
