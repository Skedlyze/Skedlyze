const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google OAuth login
router.get('/google', (req, res, next) => {
  // Check if we need to force calendar scope
  const forceCalendar = req.query.force_calendar === 'true';
  
  if (forceCalendar) {
    // Force re-authentication with calendar scope
    passport.authenticate('google', {
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      accessType: 'offline',
      prompt: 'consent'
    })(req, res, next);
  } else {
    // Normal authentication
    passport.authenticate('google')(req, res, next);
  }
});

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureMessage: true
  }),
  (req, res) => {
    // Successful authentication, redirect to dashboard
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000/dashboard');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({ 
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null
  });
});

module.exports = router;
