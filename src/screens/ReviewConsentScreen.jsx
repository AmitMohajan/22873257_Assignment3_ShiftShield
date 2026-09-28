/**
 * ReviewConsentScreen — Review all data, edit, and consent before generating snapshot
 *
 * Props received from App.jsx:
 *   workProfile       — { employmentType, hoursPerWeek, payBasis, approximateRate }
 *   concern           — Selected concern id (string)
 *   situationDetails  — Object with answers
 *   consentGiven      — Boolean, whether consent checkbox is checked
 *   setConsentGiven   — Function to update consentGiven
 *   onGenerate        — Function to advance to the snapshot screen
 *   onBack            — Function to go back
 *   onEditStep        — Function to jump to a specific step: (stepNumber) => void
 */

import { Shield, Info, Edit3 } from 'lucide-react'
import concernOptions from '../data/concernOptions'
import ActionButton from '../components/ActionButton'
import NavigationFooter from '../components/NavigationFooter'

function ReviewConsentScreen({
  workProfile,
  concern,
  situationDetails,
  consentGiven,
  setConsentGiven,
  onGenerate,
  onBack,
  onEditStep
}) {
  // Get the concern title from the options
  const concernOption = concernOptions.find((c) => c.id === concern)
  const concernTitle = concernOption ? concernOption.title : concern

  // Get readable detail values
  const detailEntries = Object.entries(situationDetails).filter(([_, val]) => val)

  return (
    <div className="screen">
      {/* Screen header */}
      <div className="screen-header">
        <div className="screen-header-icon">
          <Shield size={28} />
        </div>
        <h1 className="screen-title">Review & Consent</h1>
        <p className="screen-subtitle">
          Please review your information before generating your Situation Snapshot.
          You can edit any section.
        </p>
      </div>

      {/* Work Profile Summary */}
      <div className="review-summary">
        <div className="review-summary-header">
          <h2 className="review-summary-title">Your Work Profile</h2>
          <ActionButton
            label="Edit"
            variant="ghost"
            onClick={() => onEditStep(1)}
            icon={<Edit3 size={14} />}
          />
        </div>
        <div className="review-summary-body">
          <div className="review-item">
            <span className="review-item-label">Employment type</span>
            <span className="review-item-value">{workProfile.employmentType || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Hours per week</span>
            <span className="review-item-value">{workProfile.hoursPerWeek || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Pay basis</span>
            <span className="review-item-value">{workProfile.payBasis || '—'}</span>
          </div>
          {workProfile.approximateRate && (
            <div className="review-item">
              <span className="review-item-label">Approximate rate</span>
              <span className="review-item-value">${workProfile.approximateRate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Concern Summary */}
      <div className="review-summary">
        <div className="review-summary-header">
          <h2 className="review-summary-title">Your Concern</h2>
          <ActionButton
            label="Edit"
            variant="ghost"
            onClick={() => onEditStep(2)}
            icon={<Edit3 size={14} />}
          />
        </div>
        <div className="review-summary-body">
          <div className="review-item">
            <span className="review-item-label">Concern</span>
            <span className="review-item-value">{concernTitle}</span>
          </div>
          {detailEntries.map(([key, value]) => (
            <div className="review-item" key={key}>
              <span className="review-item-label">{formatKey(key)}</span>
              <span className="review-item-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Consent Section */}
      <div className={`review-consent-box${consentGiven ? ' consented' : ''}`}>
        <label className="consent-checkbox-row">
          <input
            type="checkbox"
            className="consent-checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
          />
          <span className="consent-text">
            <strong>I understand that this Situation Snapshot is informational only
            and does not constitute legal advice.</strong> It provides general
            decision-support guidance based on the information I have provided. I
            understand that employment laws vary by jurisdiction and that I should
            seek professional advice for my specific situation if needed.
          </span>
        </label>
      </div>

      {/* Privacy note */}
      <div className="review-privacy-note">
        <Info size={16} />
        <span>
          Your information is held temporarily in your browser and is not sent to
          or stored on any server. Closing this page will clear your data. This
          application does not use cookies, analytics, or tracking.
        </span>
      </div>

      {/* Navigation */}
      <NavigationFooter
        onBack={onBack}
        onContinue={onGenerate}
        continueLabel="Generate My Snapshot"
        continueDisabled={!consentGiven}
      />
    </div>
  )
}

// Helper to turn camelCase keys into readable labels
function formatKey(key) {
  const map = {
    frequency: 'Frequency',
    expectation: 'Expectation',
    breakType: 'Break type',
    shiftLength: 'Shift length',
    notice: 'Notice given',
    impact: 'Personal impact',
    rosterFrequency: 'Frequency',
    issueType: 'Issue type',
    duration: 'Duration',
    awardKnown: 'Award awareness',
    description: 'Description'
  }
  return map[key] || key
}

export default ReviewConsentScreen
