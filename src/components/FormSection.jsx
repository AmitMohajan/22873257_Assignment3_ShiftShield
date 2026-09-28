/**
 * FormSection — Reusable card wrapper for grouped form content
 *
 * Props:
 *   title       — Section heading text (required)
 *   description — Optional explanatory text below the title
 *   children    — The form fields or content to render inside the card
 */

function FormSection({ title, description, children }) {
  return (
    <div className="form-section">
      <h2 className="form-section-title">{title}</h2>
      {description && (
        <p className="form-section-description">{description}</p>
      )}
      <div className="form-section-children">
        {children}
      </div>
    </div>
  )
}

export default FormSection
