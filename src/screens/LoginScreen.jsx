/**
 * LoginScreen — Simple demonstration login for the MVP
 *
 * Props received from App.jsx:
 *   loginData    — { email, password } object
 *   setLoginData — Function to update loginData
 *   onLogin      — Function called on successful login (advances to next step)
 */

import { useState } from 'react'
import { Shield, AlertCircle } from 'lucide-react'
import FormInput from '../components/FormInput'
import ActionButton from '../components/ActionButton'

function LoginScreen({ loginData, setLoginData, onLogin }) {
  // Local error state for validation messages
  const [error, setError] = useState('')

  // Update a field in loginData
  const updateField = (field, value) => {
    setLoginData({ ...loginData, [field]: value })
    // Clear error when user starts typing
    if (error) setError('')
  }

  // Validate and attempt login
  const handleLogin = () => {
    if (!loginData.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (loginData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    // Login successful — advance to next screen
    onLogin()
  }

  // Allow pressing Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="login-container" onKeyDown={handleKeyDown}>
      {/* Logo and branding */}
      <div className="login-logo">
        <div className="login-logo-icon">
          <Shield size={32} />
        </div>
        <h1>ShiftShield</h1>
        <p>Workplace Situation Navigator</p>
      </div>

      {/* Login card */}
      <div className="login-card">
        {/* Error message */}
        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form fields using FormInput component */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Email address"
            type="email"
            value={loginData.email}
            onChange={(val) => updateField('email', val)}
            placeholder="your.email@example.com"
            helperText="Enter your email address."
          />

          <FormInput
            label="Password"
            type="password"
            value={loginData.password}
            onChange={(val) => updateField('password', val)}
            placeholder="Enter your password"
            helperText="Minimum 6 characters."
          />

          <ActionButton
            label="Sign In"
            variant="primary"
            onClick={handleLogin}
            fullWidth
          />
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
