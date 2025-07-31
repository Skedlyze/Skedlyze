import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import ProfilePage from './pages/ProfilePage'
import AchievementsPage from './pages/AchievementsPage'
import CalendarPage from './pages/CalendarPage'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
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
      {/* Home page is accessible to everyone */}
      <Route path="/" element={<HomePage />} />
      
      {!isAuthenticated ? (
        <Route path="/login" element={<LoginPage />} />
      ) : (
        <>
          {/* Dashboard and app routes */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>

        </>
      )}
      <Route path="*" element={
        <Navigate to={
          !isAuthenticated ? "/" : 
          "/dashboard" // Go to dashboard for authenticated users
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