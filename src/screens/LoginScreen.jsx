/**
 * LoginScreen — Authenticates the user via Supabase Auth through the Python backend
 *
 * Props received from App.jsx:
 *   loginData    — { email, password } object
 *   setLoginData — Function to update loginData
 *   onLogin      — Function called on successful login: (accessToken) => void
 */

import { useState } from 'react'
import { Shield, AlertCircle } from 'lucide-react'
import FormInput from '../components/FormInput'
import ActionButton from '../components/ActionButton'

function LoginScreen({ loginData, setLoginData, onLogin }) {
  // Local error state for validation messages
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Update a field in loginData
  const updateField = (field, value) => {
    setLoginData({ ...loginData, [field]: value })
    // Clear messages when user starts typing
    if (error) setError('')
    if (successMessage) setSuccessMessage('')
  }

  // Validate and attempt login
  const handleLogin = async () => {
    if (!loginData.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (loginData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      onLogin(data.accessToken)  // Pass token to App.jsx
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Validate and attempt registration
  const handleRegister = async () => {
    if (!loginData.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (loginData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        return
      }

      if (data.accessToken) {
        onLogin(data.accessToken)
      } else {
        setSuccessMessage(data.message || 'Account created. Please confirm your email, then sign in.')
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Allow pressing Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) handleLogin()
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

        {/* Success message */}
        {successMessage && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)',
            fontSize: 'var(--font-size-sm)', color: 'var(--color-success)'
          }}>
            <span>{successMessage}</span>
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
            disabled={isLoading}
          />

          <FormInput
            label="Password"
            type="password"
            value={loginData.password}
            onChange={(val) => updateField('password', val)}
            placeholder="Enter your password"
            helperText="Minimum 6 characters."
            disabled={isLoading}
          />

          <ActionButton
            label={isLoading ? 'Signing in...' : 'Sign In'}
            variant="primary"
            onClick={handleLogin}
            fullWidth
            disabled={isLoading}
          />

          <ActionButton
            label={isLoading ? 'Creating account...' : 'Create Account'}
            variant="secondary"
            onClick={handleRegister}
            fullWidth
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
