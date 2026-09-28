/**
 * NavigationFooter — Back / Continue navigation bar
 *
 * Props:
 *   onBack      — Callback for the Back button. Pass null/undefined to hide it.
 *   onContinue  — Callback for the Continue button. Pass null/undefined to hide it.
 *   continueLabel — Text for Continue button (default: "Continue")
 *   continueDisabled — Disables the Continue button
 *   backLabel   — Text for Back button (default: "Back")
 *   backDisabled — Disables the Back button
 */

import ActionButton from './ActionButton'
import { ArrowLeft, ArrowRight } from 'lucide-react'

function NavigationFooter({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  backLabel = 'Back',
  backDisabled = false
}) {
  return (
    <div className="navigation-footer">
      {/* Back button (left side) */}
      {onBack ? (
        <ActionButton
          label={backLabel}
          variant="secondary"
          onClick={onBack}
          disabled={backDisabled}
          icon={<ArrowLeft size={16} />}
        />
      ) : (
        <div className="navigation-footer-spacer" />
      )}

      {/* Continue button (right side) */}
      {onContinue ? (
        <ActionButton
          label={continueLabel}
          variant="primary"
          onClick={onContinue}
          disabled={continueDisabled}
          icon={<ArrowRight size={16} />}
        />
      ) : (
        <div className="navigation-footer-spacer" />
      )}
    </div>
  )
}

export default NavigationFooter
