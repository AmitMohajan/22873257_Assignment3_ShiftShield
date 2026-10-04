/**
 * WorkProfileScreen — Collects employment details with returning-user persistence
 *
 * Props received from App.jsx:
 *   workProfile    — { fullName, phoneNumber, employmentType, hoursPerWeek, payBasis, approximateRate }
 *   setWorkProfile — Function to update workProfile
 *   onContinue     — Function to advance to the next screen
 *   onBack         — Function to go back to the previous screen
 *   accessToken    — Supabase Auth JWT token for API calls
 */

import { useState, useEffect } from 'react'
import { Briefcase } from 'lucide-react'
import FormInput from '../components/FormInput'
import FormSection from '../components/FormSection'
import NavigationFooter from '../components/NavigationFooter'

// Blank profile shape used to explicitly clear stale user data
const BLANK_WORK_PROFILE = {
  fullName: '',
  phoneNumber: '',
  employmentType: '',
  hoursPerWeek: '',
  payBasis: '',
  approximateRate: ''
}

function WorkProfileScreen({ workProfile, setWorkProfile, onContinue, onBack, accessToken }) {
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Fetch saved profile on mount (returning user)
  useEffect(() => {
    if (!accessToken) {
      setIsLoadingProfile(false)
      return
    }

    fetch('/api/profile', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setWorkProfile({
            fullName: data.profile.full_name || '',
            phoneNumber: data.profile.phone_number || '',
            employmentType: data.profile.employment_type || '',
            hoursPerWeek: data.profile.hours_per_week || '',
            payBasis: data.profile.pay_basis || '',
            approximateRate: data.profile.approximate_rate || ''
          })
        } else {
          // No saved profile — explicitly reset so stale data is not shown
          setWorkProfile(BLANK_WORK_PROFILE)
        }
      })
      .catch(() => {
        // Profile fetch failed — reset to blank so stale data is not shown
        setWorkProfile(BLANK_WORK_PROFILE)
      })
      .finally(() => {
        setIsLoadingProfile(false)
      })
  }, [accessToken])

  // Update a field in workProfile
  const updateField = (field, value) => {
    setWorkProfile({ ...workProfile, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  // Validate required fields, save profile, then continue
  const handleContinue = async () => {
    const newErrors = {}
    if (!workProfile.fullName.trim()) newErrors.fullName = 'Please enter your full name.'
    if (!workProfile.phoneNumber.trim()) newErrors.phoneNumber = 'Please enter your phone number.'
    if (!workProfile.employmentType) newErrors.employmentType = 'Please select your employment type.'
    if (!workProfile.hoursPerWeek) newErrors.hoursPerWeek = 'Please enter your average hours per week.'
    if (!workProfile.payBasis) newErrors.payBasis = 'Please select your pay basis.'
    if (!workProfile.approximateRate) newErrors.approximateRate = 'Please enter your approximate rate.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Save profile to Supabase via backend
    setSaveError('')

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(workProfile)
      })

      if (!response.ok) {
        setSaveError('Unable to save your profile. Please try again.')
        return
      }

      onContinue()
    } catch (err) {
      setSaveError('Unable to save your profile. Please try again.')
    }
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
          Please complete the details below. Fields marked with * are mandatory.
        </p>
      </div>

      {/* Save error message */}
      {saveError && (
        <div className="login-error" style={{ marginBottom: '1rem' }}>
          <span>{saveError}</span>
        </div>
      )}

      {/* Personal Details section */}
      <FormSection
        title="Personal Details"
        description="Basic profile details saved for your returning ShiftShield profile."
      >
        <FormInput
          label="Full Name *"
          type="text"
          value={workProfile.fullName}
          onChange={(val) => updateField('fullName', val)}
          placeholder="e.g. Alex Chen"
          helperText="Enter your full name."
          error={errors.fullName}
          disabled={isLoadingProfile}
        />

        <FormInput
          label="Phone Number *"
          type="text"
          value={workProfile.phoneNumber}
          onChange={(val) => updateField('phoneNumber', val)}
          placeholder="e.g. 0412 345 678"
          helperText="Enter your phone number."
          error={errors.phoneNumber}
          disabled={isLoadingProfile}
        />
      </FormSection>

      {/* Employment Details section */}
      <FormSection
        title="Employment Details"
        description="This helps us understand which workplace rules may be most relevant to your situation."
      >
        <FormInput
          label="Employment Type *"
          type="select"
          value={workProfile.employmentType}
          onChange={(val) => updateField('employmentType', val)}
          options={['Casual', 'Part-time', 'Full-time', 'Fixed-term', 'Contractor/Other']}
          helperText="Your employment type can affect your workplace rights and entitlements."
          error={errors.employmentType}
          disabled={isLoadingProfile}
        />

        <FormInput
          label="Approx. Hours per Week *"
          type="number"
          value={workProfile.hoursPerWeek}
          onChange={(val) => updateField('hoursPerWeek', val)}
          placeholder="e.g. 20"
          helperText="An approximate number is fine. Standard full-time is usually around 38 hours."
          error={errors.hoursPerWeek}
          disabled={isLoadingProfile}
        />
      </FormSection>

      {/* Pay Information section */}
      <FormSection
        title="Pay Information"
        description="Understanding how you are paid helps us provide a more relevant assessment."
      >
        <FormInput
          label="Pay Basis *"
          type="select"
          value={workProfile.payBasis}
          onChange={(val) => updateField('payBasis', val)}
          options={['Hourly', 'Salary', 'Piece rate', 'Commission', 'Unsure']}
          helperText="This is how your pay is calculated. If you're unsure, select 'Unsure'."
          error={errors.payBasis}
          disabled={isLoadingProfile}
        />

        <FormInput
          label="Approximate Rate *"
          type="number"
          value={workProfile.approximateRate}
          onChange={(val) => updateField('approximateRate', val)}
          placeholder="e.g. 25.00"
          helperText="Enter your approximate hourly rate or salary."
          error={errors.approximateRate}
          disabled={isLoadingProfile}
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
