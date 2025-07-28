import React, { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import ProfilePage from './pages/ProfilePage'
import AchievementsPage from './pages/AchievementsPage'
import CalendarPage from './pages/CalendarPage'
import AdminPage from './pages/AdminPage'
import onboardingService from './services/onboardingService'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [onboardingStatus, setOnboardingStatus] = useState(null)
  const [onboardingLoading, setOnboardingLoading] = useState(true)
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false)

  const checkOnboardingStatus = useCallback(async () => {
    if (hasCheckedOnboarding) {
      return
    }

    try {
      setOnboardingLoading(true)
      const status = await onboardingService.needsOnboarding()
      setOnboardingStatus(status)
      setHasCheckedOnboarding(true)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      // If there's an error, assume user needs onboarding
      setOnboardingStatus({ needsOnboarding: true, taskCount: 0 })
      setHasCheckedOnboarding(true)
    } finally {
      setOnboardingLoading(false)
    }
  }, [hasCheckedOnboarding])

  useEffect(() => {
    if (isAuthenticated && !loading && !hasCheckedOnboarding) {
      checkOnboardingStatus()
    }
  }, [isAuthenticated, loading, hasCheckedOnboarding, checkOnboardingStatus])

  if (loading || (isAuthenticated && onboardingLoading)) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    )
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <Route path="/login" element={<LoginPage />} />
      ) : (
        <>
          <Route path="/admin" element={<AdminPage />} />
          {/* TEMPORARILY BYPASSING ONBOARDING - ALWAYS GO TO MAIN APP */}
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
          {/* Keep onboarding route available for manual access */}
          <Route path="/onboarding" element={<OnboardingPage />} />
        </>
      )}
      <Route path="*" element={
        <Navigate to={
          !isAuthenticated ? "/login" : 
          "/" // Always go to main app for now
        } replace />
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App 