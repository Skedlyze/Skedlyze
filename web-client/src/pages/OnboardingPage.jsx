import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  TrendingUp,
  EmojiEvents,
  Celebration,
  BugReport,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import onboardingService from '../services/onboardingService';

const OnboardingPage = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const goalsData = await onboardingService.getAvailableGoals();
      setGoals(goalsData);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  const handleSetGoal = async () => {
    if (!selectedGoal) return;

    try {
      setLoading(true);
      const result = await onboardingService.setUserGoal(selectedGoal.id);
      
      // Generate default tasks for the selected goal
      await onboardingService.generateDefaultTasks();
      
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error setting goal:', error);
      setError('Failed to set goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    // Navigate to home or dashboard
    window.location.href = '/';
  };

  const handleSkipOnboarding = async () => {
    try {
      const status = await onboardingService.needsOnboarding();
      console.log('Onboarding status:', status);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Debug Section */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          <BugReport sx={{ mr: 1, verticalAlign: 'middle' }} />
          Debug Info
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleSkipOnboarding}
          sx={{ mb: 2 }}
        >
          Check Onboarding Status
        </Button>
        {debugInfo && (
          <Paper sx={{ p: 2, backgroundColor: 'white' }}>
            <Typography variant="body2" component="pre">
              {JSON.stringify(debugInfo, null, 2)}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to Skedlyze! 🚀
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Let's personalize your experience by choosing your primary goal
        </Typography>
        
        <Stepper activeStep={0} sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Step>
            <StepLabel>Choose Your Goal</StepLabel>
          </Step>
          <Step>
            <StepLabel>Get Started</StepLabel>
          </Step>
        </Stepper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Goals Selection */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
          What's your main focus?
        </Typography>
        
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedGoal?.id === goal.id ? 3 : 1,
                  borderColor: selectedGoal?.id === goal.id ? goal.color : 'divider',
                  backgroundColor: selectedGoal?.id === goal.id ? `${goal.color}10` : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: goal.color,
                  },
                }}
                onClick={() => handleGoalSelect(goal)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        mr: 2,
                        color: goal.color,
                        fontSize: '2.5rem'
                      }}
                    >
                      {goal.icon}
                    </Typography>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {goal.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {goal.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You'll get tasks like:
                  </Typography>

                  <List dense sx={{ mb: 2 }}>
                    {goal.benefits.slice(0, 2).map((benefit, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ fontSize: 16, color: goal.color }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {selectedGoal?.id === goal.id && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Chip
                        icon={<CheckCircle />}
                        label="Selected"
                        color="primary"
                        variant="filled"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="center" sx={{ mt: 6 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSetGoal}
          disabled={!selectedGoal || submitting}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 2,
            minWidth: 200,
          }}
        >
          {submitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Let\'s Go!'
          )}
        </Button>
      </Box>

      {/* Success Dialog */}
      <Dialog 
        open={showSuccessDialog} 
        onClose={handleSuccessClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <Celebration sx={{ fontSize: 64, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" component="h2">
            Welcome to Your Journey! 🎉
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Great choice! We've set up your personalized task system based on your 
            <strong> {selectedGoal?.name}</strong> goal.
          </Typography>
          
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.50' }}>
            <Typography variant="h6" gutterBottom>
              What's Next?
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Star sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText primary="Daily tasks have been generated for you" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText primary="Start earning XP by completing tasks" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmojiEvents sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText primary="Level up and unlock achievements" />
              </ListItem>
            </List>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSuccessClose}
            sx={{ minWidth: 150 }}
          >
            Let's Go!
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OnboardingPage; 