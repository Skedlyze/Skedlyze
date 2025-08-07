const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const path = require('path');
const config = require('./config/environment');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const calendarRoutes = require('./routes/calendar');

// Import middleware
const isAuthenticated = require('./middleware/isAuthenticated');

// Import database connection
const db = require('./db/knex');

const app = express();
const PORT = config.getPort();

// Middleware
app.use(cors({
  origin: config.isProduction ? config.getBaseUrl() : config.getClientUrl(),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: config.getSessionSecret() || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction, // Use HTTPS in production
    httpOnly: true,
    sameSite: config.isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
    domain: config.isProduction ? undefined : 'localhost', // Let browser set domain in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Debug session middleware (development only)
if (!config.isProduction) {
  app.use((req, res, next) => {
    console.log('📋 Session Debug:');
    console.log('  - Session ID:', req.sessionID);
    console.log('  - Session:', req.session);
    console.log('  - User:', req.user);
    next();
  });
}

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./config/passport');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', isAuthenticated, taskRoutes);
app.use('/api/users', isAuthenticated, userRoutes);
app.use('/api/calendar', isAuthenticated, calendarRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Skedlyze API is running' });
});

// Serve static files from React build (only in production)
if (process.env.NODE_ENV === 'production') {
  // Debug middleware for production
  app.use((req, res, next) => {
    console.log(`📄 Request: ${req.method} ${req.url}`);
    next();
  });

  // Serve assets directory specifically
  app.use('/assets', (req, res, next) => {
    console.log(`🎯 Assets request: ${req.url}`);
    const filePath = path.join(__dirname, '../web-client/dist/assets', req.url);
    console.log(`📁 Looking for file: ${filePath}`);
    
    if (req.url.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      console.log(`🔧 Set MIME type for JS file: ${req.url}`);
    }
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.log(`❌ File not found: ${filePath}`);
        next();
      } else {
        console.log(`✅ Served file: ${filePath}`);
      }
    });
  });

  // Serve other static files
  app.use(express.static(path.join(__dirname, '../web-client/dist'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        console.log(`🔧 Set MIME type for: ${path}`);
      }
    }
  }));

  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    console.log(`📄 Serving index.html for: ${req.url}`);
    res.sendFile(path.join(__dirname, '../web-client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Skedlyze server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Run database migrations in production
  if (process.env.NODE_ENV === 'production') {
    try {
      await db.migrate.latest();
      console.log('✅ Database migrations completed');
    } catch (error) {
      console.error('❌ Database migration failed:', error);
      console.log('⚠️ Continuing without migrations - some features may not work');
    }
  }
});

module.exports = app;
