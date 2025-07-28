import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import {
  DeleteForever,
  Refresh,
  Warning,
} from '@mui/icons-material';
import onboardingService from '../services/onboardingService';

const AdminPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResetUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      await onboardingService.resetUserData();
      setMessage('User data reset successfully. You will be redirected to onboarding.');
      
      // Redirect to onboarding after a short delay
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 2000);
      
    } catch (err) {
      setError('Failed to reset user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWipeAllData = async () => {
    if (!window.confirm('Are you sure you want to wipe ALL data? This cannot be undone!')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      
      await onboardingService.wipeAllData();
      setMessage('All data wiped successfully. Please refresh the page.');
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError('Failed to wipe all data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Admin Panel
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your data and reset settings
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Refresh sx={{ mr: 1, verticalAlign: 'middle' }} />
                Reset User Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Clear your tasks, goals, and progress. You'll be redirected to onboarding.
              </Typography>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleResetUserData}
                disabled={loading}
                fullWidth
              >
                Reset My Data
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <DeleteForever sx={{ mr: 1, verticalAlign: 'middle' }} />
                Wipe All Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <Warning sx={{ mr: 0.5, fontSize: 16, verticalAlign: 'middle' }} />
                <strong>Dangerous!</strong> This will delete ALL data for ALL users.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={handleWipeAllData}
                disabled={loading}
                fullWidth
              >
                Wipe All Data
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPage; 