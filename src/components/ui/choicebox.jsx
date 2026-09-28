/**
 * ChoiceboxGroup — Adapted from 21st.dev Choicebox component
 * Source: https://21st.dev (tigran tumasov)
 *
 * Adapted to plain JSX + CSS for ShiftShield's existing architecture.
 * No Tailwind, TypeScript, or external dependencies required.
 *
 * Props:
 *   direction  — "row" or "column" layout
 *   label      — Optional group label
 *   showLabel  — Whether to display the label
 *   onChange   — State setter: (value: string) => void
 *   type       — "radio" (single select)
 *   value      — Currently selected value (string)
 *   children   — ChoiceboxGroup.Item elements
 *   disabled   — Disables all items
 */

import React from 'react'

export function ChoiceboxGroup({
  direction = 'column',
  label,
  showLabel = false,
  onChange,
  type = 'radio',
  value,
  children,
  disabled = false
}) {
  return (
    <div className="choicebox-group">
      {showLabel && label && (
        <label className="choicebox-group-label">{label}</label>
      )}
      <div className={`choicebox-group-items ${direction === 'row' ? 'choicebox-row' : 'choicebox-column'}`}>
        {React.Children.map(children, (child) => {
          return React.cloneElement(child, {
            onChange,
            type,
            valueSelected: value,
            disabled: disabled || child.props.disabled
          })
        })}
      </div>
    </div>
  )
}

/**
 * ChoiceboxGroup.Item — Individual selectable card
 *
 * Props:
 *   title        — Card heading
 *   description  — Card description text
 *   value        — This item's unique value
 *   type         — "radio" or "checkbox" (injected by parent)
 *   valueSelected — Currently selected value(s) (injected by parent)
 *   onChange      — Selection handler (injected by parent)
 *   disabled     — Disables this item
 *   children     — Optional extra content (e.g. icons) rendered above title
 */

function ChoiceboxItem({
  title,
  description,
  value,
  type = 'radio',
  valueSelected,
  onChange,
  disabled = false,
  children
}) {
  const isSelected = typeof valueSelected === 'string'
    ? value === valueSelected
    : valueSelected?.includes(value)

  const handleClick = () => {
    if (onChange && !disabled) {
      onChange(value)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className={`choicebox-item ${isSelected ? 'choicebox-item-selected' : ''} ${disabled ? 'choicebox-item-disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={type === 'radio' ? 'radio' : 'checkbox'}
      aria-checked={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Optional extra content (icons, etc.) */}
      {children && (
        <div className="choicebox-item-extra">
          {children}
        </div>
      )}

      {/* Text content */}
      <div className="choicebox-item-text">
        <span className="choicebox-item-title">{title}</span>
        <span className="choicebox-item-description">{description}</span>
      </div>

      {/* Radio / Checkbox indicator */}
      <div className="choicebox-item-indicator">
        <span className={`choicebox-radio ${isSelected ? 'choicebox-radio-selected' : ''}`}>
          {isSelected && <span className="choicebox-radio-dot" />}
        </span>
      </div>
    </div>
  )
}

ChoiceboxGroup.Item = ChoiceboxItem
