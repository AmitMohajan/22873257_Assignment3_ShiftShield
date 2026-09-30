import { useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import WorkProfileScreen from './screens/WorkProfileScreen'
import WorkplaceConcernScreen from './screens/WorkplaceConcernScreen'
import SituationDetailsScreen from './screens/SituationDetailsScreen'
import ReviewConsentScreen from './screens/ReviewConsentScreen'
import SituationSnapshotScreen from './screens/SituationSnapshotScreen'
import ProgressBar from './components/ProgressBar'

// Step labels for the progress bar
const STEP_LABELS = [
  'Login',
  'Work Profile',
  'Concern',
  'Details',
  'Review',
  'Snapshot'
]

// Default work profile shape (used for initial state and reset)
const DEFAULT_WORK_PROFILE = {
  fullName: '',
  phoneNumber: '',
  employmentType: '',
  hoursPerWeek: '',
  payBasis: '',
  approximateRate: ''
}

function App() {
  // Current step (0 = Login, 1 = Work Profile, ... 5 = Snapshot)
  const [currentStep, setCurrentStep] = useState(0)

  // Login data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Authentication token (stored in React state, cleared on logout/refresh)
  const [accessToken, setAccessToken] = useState('')

  // Work profile data
  const [workProfile, setWorkProfile] = useState(DEFAULT_WORK_PROFILE)

  // Selected workplace concern (single string value)
  const [concern, setConcern] = useState('')

  // Situation details (dynamic fields based on concern)
  const [situationDetails, setSituationDetails] = useState({})

  // Consent state
  const [consentGiven, setConsentGiven] = useState(false)

  // Navigation helpers
  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5))
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0))
  const goToStep = (step) => setCurrentStep(step)

  // Handle successful login — store the access token and advance
  const handleLogin = (token) => {
    setAccessToken(token)
    goNext()
  }

  // Reset everything and return to login (logout)
  const startOver = () => {
    setLoginData({ email: '', password: '' })
    setWorkProfile(DEFAULT_WORK_PROFILE)
    setConcern('')
    setSituationDetails({})
    setConsentGiven(false)
    setAccessToken('')
    setCurrentStep(0)
  }

  // Render the current screen based on currentStep
  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return (
          <LoginScreen
            loginData={loginData}
            setLoginData={setLoginData}
            onLogin={handleLogin}
          />
        )
      case 1:
        return (
          <WorkProfileScreen
            workProfile={workProfile}
            setWorkProfile={setWorkProfile}
            onContinue={goNext}
            onBack={goBack}
            accessToken={accessToken}
          />
        )
      case 2:
        return (
          <WorkplaceConcernScreen
            concern={concern}
            setConcern={setConcern}
            onContinue={goNext}
            onBack={goBack}
          />
        )
      case 3:
        return (
          <SituationDetailsScreen
            concern={concern}
            situationDetails={situationDetails}
            setSituationDetails={setSituationDetails}
            onContinue={goNext}
            onBack={goBack}
          />
        )
      case 4:
        return (
          <ReviewConsentScreen
            workProfile={workProfile}
            concern={concern}
            situationDetails={situationDetails}
            consentGiven={consentGiven}
            setConsentGiven={setConsentGiven}
            onGenerate={goNext}
            onBack={goBack}
            onEditStep={goToStep}
            accessToken={accessToken}
          />
        )
      case 5:
        return (
          <SituationSnapshotScreen
            workProfile={workProfile}
            concern={concern}
            situationDetails={situationDetails}
            onStartOver={startOver}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      {/* Show progress bar on all screens except login */}
      {currentStep > 0 && (
        <ProgressBar currentStep={currentStep} steps={STEP_LABELS} />
      )}

      <main className="app-main">
        {renderScreen()}
      </main>

      <footer className="app-footer">
        <p>ShiftShield provides general informational guidance only. It does not constitute legal advice.</p>
      </footer>
    </div>
  )
}

export default App
