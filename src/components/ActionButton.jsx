/**
 * ActionButton — Reusable button component
 *
 * Props:
 *   label     — Button text (required)
 *   variant   — Visual style: "primary", "secondary", "ghost"
 *   onClick   — Click handler function
 *   disabled  — Disables the button when true
 *   fullWidth — Stretches button to full width when true
 *   icon      — Optional React node to render before the label
 *   type      — HTML button type: "button" (default) or "submit"
 */

function ActionButton({
  label,
  variant = 'primary',
  onClick,
  disabled = false,
  fullWidth = false,
  icon = null,
  type = 'button'
}) {
  // Build CSS class from variant and fullWidth prop
  const className = [
    'btn',
    `btn-${variant}`,
    fullWidth ? 'btn-full' : ''
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {label}
    </button>
  )
}

export default ActionButton
