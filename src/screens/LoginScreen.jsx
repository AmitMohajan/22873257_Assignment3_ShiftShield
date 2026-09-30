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
  const [isLoading, setIsLoading] = useState(false)

  // Update a field in loginData
  const updateField = (field, value) => {
    setLoginData({ ...loginData, [field]: value })
    // Clear error when user starts typing
    if (error) setError('')
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
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
