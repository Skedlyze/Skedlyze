const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Base URLs
const getBaseUrl = () => {
  if (isProduction) {
    return process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
  }
  return 'http://localhost:3000';
};

const getApiUrl = () => {
  if (isProduction) {
    return getBaseUrl();
  }
  return 'http://localhost:5000';
};

// OAuth callback URLs
const getGoogleCallbackUrl = () => {
  if (isProduction) {
    return `${getBaseUrl()}/api/auth/google/callback`;
  }
  // For development, callback goes directly to backend server
  return `http://localhost:5000/api/auth/google/callback`;
};

// Client URL for CORS
const getClientUrl = () => {
  if (isProduction) {
    return getBaseUrl();
  }
  return 'http://localhost:3000';
};

module.exports = {
  isProduction,
  isDevelopment,
  getBaseUrl,
  getApiUrl,
  getGoogleCallbackUrl,
  getClientUrl,
  getPort: () => process.env.PORT || (isProduction ? 10000 : 5000),
  getDatabaseUrl: () => process.env.DATABASE_URL,
  getSessionSecret: () => process.env.SESSION_SECRET,
  getGoogleClientId: () => process.env.GOOGLE_CLIENT_ID,
  getGoogleClientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
  getGoogleCalendarApiKey: () => process.env.GOOGLE_CALENDAR_API_KEY
};
