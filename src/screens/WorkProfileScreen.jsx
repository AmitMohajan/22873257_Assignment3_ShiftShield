/**
 * WorkProfileScreen — Collects employment details
 *
 * Props received from App.jsx:
 *   workProfile    — { employmentType, hoursPerWeek, payBasis, approximateRate }
 *   setWorkProfile — Function to update workProfile
 *   onContinue     — Function to advance to the next screen
 *   onBack         — Function to go back to the previous screen
 */

import { useState } from 'react'
import { Briefcase, Info } from 'lucide-react'
import FormInput from '../components/FormInput'
import FormSection from '../components/FormSection'
import NavigationFooter from '../components/NavigationFooter'

function WorkProfileScreen({ workProfile, setWorkProfile, onContinue, onBack }) {
  const [errors, setErrors] = useState({})

  // Update a field in workProfile
  const updateField = (field, value) => {
    setWorkProfile({ ...workProfile, [field]: value })
    // Clear error for this field when user makes a change
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  // Validate required fields before continuing
  const handleContinue = () => {
    const newErrors = {}
    if (!workProfile.employmentType) newErrors.employmentType = 'Please select your employment type.'
    if (!workProfile.hoursPerWeek) newErrors.hoursPerWeek = 'Please enter your average hours per week.'
    if (!workProfile.payBasis) newErrors.payBasis = 'Please select your pay basis.'

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
          <Briefcase size={28} />
        </div>
        <h1 className="screen-title">Your Work Profile</h1>
        <p className="screen-subtitle">
          Tell us about your work situation. We only ask for information that helps
          assess your concern. Nothing is stored permanently.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="review-privacy-note" style={{ marginBottom: '1.5rem' }}>
        <Info size={16} />
        <span>
          We do not ask for your name, address, date of birth, or employer details.
          All information stays in your browser and is cleared when you close the page.
        </span>
      </div>

      {/* Employment Details section */}
      {/*
        PARENT-TO-CHILD PROPS:
        FormSection receives title, description, and children as props.
        FormInput receives label, type, value, onChange, options, helperText, and error.
        This demonstrates props flowing from WorkProfileScreen → FormSection/FormInput.
      */}
      <FormSection
        title="Employment Details"
        description="This helps us understand which workplace rules may be most relevant to your situation."
      >
        <FormInput
          label="Employment Type"
          type="select"
          value={workProfile.employmentType}
          onChange={(val) => updateField('employmentType', val)}
          options={['Casual', 'Part-time', 'Full-time', 'Fixed-term', 'Contractor/Other']}
          helperText="Your employment type can affect your workplace rights and entitlements."
          error={errors.employmentType}
        />

        <FormInput
          label="Average Hours Per Week"
          type="number"
          value={workProfile.hoursPerWeek}
          onChange={(val) => updateField('hoursPerWeek', val)}
          placeholder="e.g. 20"
          helperText="An approximate number is fine. Standard full-time is usually around 38 hours."
          error={errors.hoursPerWeek}
        />
      </FormSection>

      {/* Pay Information section */}
      <FormSection
        title="Pay Information"
        description="Understanding how you are paid helps us provide a more relevant assessment."
      >
        <FormInput
          label="Pay Basis"
          type="select"
          value={workProfile.payBasis}
          onChange={(val) => updateField('payBasis', val)}
          options={['Hourly', 'Salary', 'Piece rate', 'Commission', 'Unsure']}
          helperText="This is how your pay is calculated. If you're unsure, select 'Unsure'."
          error={errors.payBasis}
        />

        <FormInput
          label="Approximate Hourly Rate or Salary (optional)"
          type="number"
          value={workProfile.approximateRate}
          onChange={(val) => updateField('approximateRate', val)}
          placeholder="e.g. 25.00"
          helperText="This field is completely optional. An approximate figure is fine."
        />
      </FormSection>

      {/* Navigation */}
      <NavigationFooter
        onBack={onBack}
        onContinue={handleContinue}
      />
    </div>
  )
}

export default WorkProfileScreen
