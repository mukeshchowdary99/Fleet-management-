import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ConfigRequired } from './components/common/ConfigRequired'
import { LoadingScreen } from './components/ui/States'
import { FleetDataProvider } from './contexts/FleetDataContext'
import { isSupabaseConfigured } from './lib/env'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute, PublicOnlyRoute } from './routes/RouteGuards'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const FleetPage = lazy(() => import('./pages/FleetPage').then((module) => ({ default: module.FleetPage })))
const LiveTrackingPage = lazy(() => import('./pages/LiveTrackingPage').then((module) => ({ default: module.LiveTrackingPage })))
const TripsPage = lazy(() => import('./pages/TripsPage').then((module) => ({ default: module.TripsPage })))
const TripDetailPage = lazy(() => import('./pages/TripDetailPage').then((module) => ({ default: module.TripDetailPage })))
const AlertsPage = lazy(() => import('./pages/AlertsPage').then((module) => ({ default: module.AlertsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))

export default function App() {
  const configured = isSupabaseConfigured

  return (
    <Suspense fallback={<LoadingScreen label="Loading workspace…" />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {configured ? (
          <>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<FleetDataProvider><AppShell /></FleetDataProvider>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/fleet" element={<FleetPage />} />
                <Route path="/tracking" element={<LiveTrackingPage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/:tripId" element={<TripDetailPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </>
        ) : (
          <Route path="*" element={<ConfigRequired />} />
        )}
      </Routes>
    </Suspense>
  )
}
