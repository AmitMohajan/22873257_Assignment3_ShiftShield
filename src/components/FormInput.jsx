/**
 * FormInput — Reusable form field component
 *
 * Props:
 *   label     — The field label text (required)
 *   type      — Input type: "text", "email", "password", "number", "select", "textarea"
 *   value     — Current field value
 *   onChange  — Callback when value changes: (newValue) => void
 *   options   — Array of options for "select" type: ["Option 1", "Option 2"]
 *   placeholder — Placeholder text
 *   helperText — Explanatory text shown below the field
 *   error     — Error message string (shown in red below the field)
 *   disabled  — Disables the input
 *   maxLength — Maximum character count (shows counter for textarea)
 *   id        — HTML id attribute (auto-generated from label if not provided)
 */

function FormInput({
  label,
  type = 'text',
  value = '',
  onChange,
  options = [],
  placeholder = '',
  helperText = '',
  error = '',
  disabled = false,
  maxLength,
  id
}) {
  // Generate a simple id from the label if none is provided
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  // Handle input change — extract the value from the event
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  // Build the CSS class for the input, including error state
  const inputClassName = `form-input${error ? ' error' : ''}`
  const selectClassName = `form-select${error ? ' error' : ''}`
  const textareaClassName = `form-textarea${error ? ' error' : ''}`

  return (
    <div className="form-group">
      {/* Label */}
      <label className="form-label" htmlFor={inputId}>
        {label}
      </label>

      {/* Render the appropriate input type */}
      {type === 'select' ? (
        <select
          id={inputId}
          className={selectClassName}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        >
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <>
          <textarea
            id={inputId}
            className={textareaClassName}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={4}
          />
          {/* Show character count if maxLength is set */}
          {maxLength && (
            <span className="char-count">
              {value.length} / {maxLength}
            </span>
          )}
        </>
      ) : (
        <input
          id={inputId}
          className={inputClassName}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
        />
      )}

      {/* Helper text (only shown if no error) */}
      {helperText && !error && (
        <span className="form-helper">{helperText}</span>
      )}

      {/* Error message */}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default FormInput
