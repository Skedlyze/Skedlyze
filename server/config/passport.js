const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const db = require('../db/knex');
const GamificationService = require('../services/gamificationService');
const UserManagementService = require('../services/userManagementService');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    // Temporarily return a mock user to avoid database connection
    done(null, { id, name: 'Test User', email: 'test@example.com' });
    // const user = await db('users').where({ id }).first();
    // done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Temporarily return a mock user to avoid database connection
      const mockUser = {
        id: profile.id,
        google_id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0]?.value,
        level: 0,
        experience_points: 0,
        streak_days: 0,
        total_tasks_completed: 0,
        total_tasks_created: 0,
        preferences: JSON.stringify({}),
        calendar_sync_enabled: false
      };
      
      return done(null, mockUser);
      
      // Check if user already exists
      // let user = await db('users').where({ google_id: profile.id }).first();
      
      // if (user) {
      //   // Update existing user's tokens and refresh profile picture
      //   await db('users')
      //     .where({ id: user.id })
      //     .update({
      //       access_token: accessToken,
      //       refresh_token: refreshToken,
      //       token_expires_at: new Date(Date.now() + 3600 * 1000), // 1 hour
      //       picture: profile.photos[0]?.value || user.picture, // Update picture if available
      //       updated_at: new Date()
      //     });
        
      //   user = await db('users').where({ id: user.id }).first();
      // } else {
      //   // Create new user
      //   const [newUser] = await db('users').insert({
      //     google_id: profile.id,
      //     email: profile.emails[0].value,
      //     name: profile.displayName,
      //     picture: profile.photos[0]?.value,
      //     access_token: accessToken,
      //     refresh_token: refreshToken,
      //     token_expires_at: new Date(Date.now() + 3600 * 1000), // 1 hour
      //     level: 0,
      //     experience_points: 0,
      //     streak_days: 0,
      //     total_tasks_completed: 0,
      //     total_tasks_created: 0,
      //     preferences: JSON.stringify({}),
      //     calendar_sync_enabled: false
      //   }).returning('*');
        
      //   // Initialize user data based on their type (new user, admin, or existing)
      //   await UserManagementService.initializeUserData(newUser.id, newUser.email);
        
      //   user = newUser;
      // }
      
      // return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('Google OAuth not configured - skipping strategy initialization');
}

module.exports = passport;
