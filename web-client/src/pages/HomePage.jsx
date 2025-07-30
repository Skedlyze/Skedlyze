import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Stack,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Schedule, 
  TrendingUp, 
  Psychology, 
  EmojiEvents,
  ArrowForward,
  Login,
  Person,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleProfileMenuClose();
  };

  const features = [
    {
      icon: <Schedule sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Calendar Integration',
      description: 'Seamlessly sync with Google Calendar to manage your daily tasks and events'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Progress Tracking',
      description: 'Monitor your productivity with XP, coins, streaks, and detailed statistics'
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Gamified Tasks',
      description: 'Turn everyday tasks into rewarding quests with XP and achievement systems'
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Achievements & Rewards',
      description: 'Earn achievements, unlock rewards, and celebrate your productivity milestones'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header with Login Button */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 2
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.primary.main
              }}
            >
              Skedlyze
            </Typography>
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Go to Dashboard
                </Button>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0 }}
                >
                  <Avatar 
                    src={user?.picture}
                    sx={{ 
                      width: 32, 
                      height: 32,
                      bgcolor: theme.palette.primary.main 
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => { navigate('/dashboard/profile'); handleProfileMenuClose(); }}>
                    <Person sx={{ mr: 1 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: 12, 
          pb: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 3,
                  lineHeight: 1.2
                }}
              >
                Gamify Your Life
              </Typography>
                              <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4,
                    opacity: 0.9,
                    lineHeight: 1.6
                  }}
                >
                  Skedlyze is a gamified lifestyle scheduler that turns real-life tasks into rewarding quests. 
                  Users plan their day using a calendar-integrated system, complete tasks to earn XP, coins, 
                  and achievements, and track their progress with streaks and stats. Designed with Google 
                  Calendar integration, it brings structure, motivation, and fun into everyday productivity.
                </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  mb: 4,
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Make an Account'}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 400
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 500,
                    height: 300,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Typography variant="h6" sx={{ opacity: 0.8 }}>
                    Interactive Demo Coming Soon
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            align="center" 
            sx={{ 
              mb: 6,
              fontWeight: 'bold'
            }}
          >
            Why Choose Skedlyze?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2,
                        fontWeight: 'bold'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 3,
                fontWeight: 'bold'
              }}
            >
              Ready to Boost Your Productivity?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4,
                opacity: 0.9
              }}
            >
              Start turning your daily tasks into rewarding quests and track your productivity journey
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              sx={{
                bgcolor: 'white',
                color: theme.palette.secondary.main,
                px: 6,
                py: 2,
                borderRadius: 3,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Make an Account'}
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default HomePage; 