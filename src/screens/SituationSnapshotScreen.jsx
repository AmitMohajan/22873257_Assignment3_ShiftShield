/**
 * SituationSnapshotScreen — Displays the generated Situation Snapshot
 *
 * Props received from App.jsx:
 *   workProfile      — { employmentType, hoursPerWeek, payBasis, approximateRate }
 *   concern          — Selected concern id (string)
 *   situationDetails — Object with answers
 *   onStartOver      — Function to reset all state and return to login
 */

import { ShieldCheck, AlertTriangle, AlertCircle, Info, ChevronRight, RotateCcw } from 'lucide-react'
import { calculateSnapshot } from '../data/snapshotRules'
import ActionButton from '../components/ActionButton'
import concernOptions from '../data/concernOptions'
import { Badge } from '../components/ui/badge'

// Icons for each attention level
const levelIcons = {
  low: ShieldCheck,
  review: AlertTriangle,
  attention: AlertCircle
}

// Badge variant for each attention level (21st.dev Badge by shugar)
const levelBadgeVariant = {
  low: 'green',
  review: 'amber',
  attention: 'red'
}

function SituationSnapshotScreen({ workProfile, concern, situationDetails, onStartOver }) {
  // Calculate the snapshot using our transparent rules
  const snapshot = calculateSnapshot(workProfile, concern, situationDetails)
  const concernOption = concernOptions.find((c) => c.id === concern)
  const LevelIcon = levelIcons[snapshot.level] || ShieldCheck

  return (
    <div className="snapshot-container">
      {/* Screen header */}
      <div className="screen-header">
        <h1 className="screen-title">Your Situation Snapshot</h1>
        <p className="screen-subtitle">
          Based on the information you provided about your{' '}
          <strong>{concernOption ? concernOption.title.toLowerCase() : 'concern'}</strong>.
        </p>
      </div>

      {/* Attention Level Banner */}
      <div className={`snapshot-attention-banner ${snapshot.level}`}>
        <div className="snapshot-attention-icon">
          <LevelIcon size={26} />
        </div>
        <div className="snapshot-attention-text">
          <h2>{snapshot.levelLabel}</h2>
          <Badge variant={levelBadgeVariant[snapshot.level] || 'gray'} size="lg">
            {snapshot.levelLabel}
          </Badge>
          <p>{snapshot.levelDescription}</p>
        </div>
      </div>

      {/* Contributing Factors */}
      {snapshot.factors.length > 0 && (
        <div className="snapshot-factors">
          <h3>Contributing Factors</h3>
          {snapshot.factors.map((factor, index) => (
            <div key={index} className="snapshot-factor-item">
              <ChevronRight size={16} />
              <span>{factor.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Next-Step Guidance */}
      <div className="snapshot-guidance">
        <h3>Suggested Next Steps</h3>
        <ul>
          {snapshot.guidance.map((item, index) => (
            <li key={index}>
              <ChevronRight size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations Notice */}
      <div className="snapshot-limitations">
        <h3>
          <Info size={18} />
          Important Limitations
        </h3>
        <p>
          This Situation Snapshot is generated using transparent front-end rules,
          not artificial intelligence or legal analysis. It provides general
          informational guidance only and should not be treated as legal advice.
          Employment laws vary by jurisdiction and individual circumstances. If
          you need advice specific to your situation, please consult a qualified
          professional or your relevant workplace relations body.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Your Work Profile and this submitted situation are stored in Supabase
          and linked to your authenticated user account. Your Work Profile can be
          restored when you sign in again.
        </p>
      </div>

      {/* Actions */}
      <div className="snapshot-actions">
        <ActionButton
          label="Start Over"
          variant="secondary"
          onClick={onStartOver}
          icon={<RotateCcw size={16} />}
        />
      </div>
    </div>
  )
}

export default SituationSnapshotScreen
