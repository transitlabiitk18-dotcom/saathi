import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout, ResearcherLayout } from './components/Layout'
import { Card, Spinner } from './components/ui'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChildProvider, useChildren } from './context/ChildContext'
import { CONSENT_VERSION } from './content/consent'
import { I18nProvider, useI18n } from './i18n'
import { firebaseConfigured } from './lib/firebase'
import { AccountPage } from './pages/AccountPage'
import { AssessmentResultPage } from './pages/AssessmentResultPage'
import { AssessmentsPage } from './pages/AssessmentsPage'
import { AtecPage } from './pages/AtecPage'
import { AuthPage } from './pages/AuthPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { ChildrenPage } from './pages/ChildrenPage'
import { ConsentPage } from './pages/ConsentPage'
import { DashboardPage } from './pages/DashboardPage'
import { InterventionDetailPage } from './pages/InterventionDetailPage'
import { InterventionsPage } from './pages/InterventionsPage'
import { McHatPage } from './pages/McHatPage'
import { NewAssessmentPage } from './pages/NewAssessmentPage'
import { ParticipantPage } from './pages/research/ParticipantPage'
import { NewStudyPage, StudiesPage } from './pages/research/StudiesPage'
import { StudyPage } from './pages/research/StudyPage'
import { RoutinePlayerPage } from './pages/RoutinePlayerPage'
import { RoutinesPage } from './pages/RoutinesPage'
import { TrackPage } from './pages/TrackPage'
import { TrendsPage } from './pages/TrendsPage'

export default function App() {
  return (
    <I18nProvider>
      {firebaseConfigured ? (
        <AuthProvider>
          <BrowserRouter>
            <Gate />
          </BrowserRouter>
        </AuthProvider>
      ) : (
        <SetupNotice />
      )}
    </I18nProvider>
  )
}

function Gate() {
  const { user, profile, loading } = useAuth()
  const { t } = useI18n()

  if (loading) return <Spinner label={t('loading')} />
  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<AuthPage mode="login" />} />
      </Routes>
    )
  }
  // Right after sign-up the profile document is being written; Register fills it in.
  if (!profile) return <Spinner label={t('loading')} />
  if (profile.consent?.general?.version !== CONSENT_VERSION) return <ConsentPage />

  if (profile.mode === 'researcher') return <ResearcherRoutes />
  return (
    <ChildProvider>
      <SignedInRoutes />
    </ChildProvider>
  )
}

function ResearcherRoutes() {
  return (
    <Routes>
      <Route element={<ResearcherLayout />}>
        <Route index element={<StudiesPage />} />
        <Route path="studies/new" element={<NewStudyPage />} />
        <Route path="studies/:sid" element={<StudyPage />} />
        <Route path="studies/:sid/p/:childId/*" element={<ParticipantPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function SignedInRoutes() {
  const { child, loading } = useChildren()
  const { t } = useI18n()
  if (loading) return <Spinner label={t('loading')} />

  const needChild = (el: ReactNode) => (child ? el : <Navigate to="/children" replace />)
  return (
    <Routes>
      <Route path="/routines/:id/play" element={needChild(<RoutinePlayerPage />)} />
      <Route element={<Layout />}>
        <Route index element={needChild(<DashboardPage />)} />
        <Route path="track" element={needChild(<TrackPage />)} />
        <Route path="interventions" element={needChild(<InterventionsPage />)} />
        <Route path="interventions/:id" element={needChild(<InterventionDetailPage />)} />
        <Route path="assess" element={needChild(<AssessmentsPage />)} />
        <Route path="assess/new" element={needChild(<NewAssessmentPage />)} />
        <Route path="assess/checklist" element={needChild(<ChecklistPage />)} />
        <Route path="assess/mchat" element={needChild(<McHatPage />)} />
        <Route path="assess/atec" element={needChild(<AtecPage />)} />
        <Route path="assess/:id" element={needChild(<AssessmentResultPage />)} />
        <Route path="trends" element={needChild(<TrendsPage />)} />
        <Route path="routines" element={needChild(<RoutinesPage />)} />
        <Route path="children" element={<ChildrenPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function SetupNotice() {
  const { t } = useI18n()
  return (
    <div className="grid min-h-screen place-items-center bg-sand-50 p-6">
      <Card className="max-w-lg">
        <div className="text-4xl">🔌</div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-800">{t('setupTitle')}</h1>
        <p className="mt-2 text-slate-600">{t('setupBody')}</p>
      </Card>
    </div>
  )
}
