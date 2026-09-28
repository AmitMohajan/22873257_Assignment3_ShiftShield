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

function App() {
  // Current step (0 = Login, 1 = Work Profile, ... 5 = Snapshot)
  const [currentStep, setCurrentStep] = useState(0)

  // Login data (demo only — not sent anywhere)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Work profile data
  const [workProfile, setWorkProfile] = useState({
    employmentType: '',
    hoursPerWeek: '',
    payBasis: '',
    approximateRate: ''
  })

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

  // Reset everything and return to login
  const startOver = () => {
    setLoginData({ email: '', password: '' })
    setWorkProfile({ employmentType: '', hoursPerWeek: '', payBasis: '', approximateRate: '' })
    setConcern('')
    setSituationDetails({})
    setConsentGiven(false)
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
            onLogin={goNext}
          />
        )
      case 1:
        return (
          <WorkProfileScreen
            workProfile={workProfile}
            setWorkProfile={setWorkProfile}
            onContinue={goNext}
            onBack={goBack}
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
