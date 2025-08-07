# Skedlyze Deployment Guide

TO CURSOR AGENT ALWAYS ASK BEFORE UPDATING THIS

## Local Development

The application is now configured to work locally with:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: Render PostgreSQL (remote)

## Render Deployment

### Single Service Deployment

The application is now configured to run as a **single service** on Render, serving both the backend API and frontend from the same domain.

Create a new **Web Service** on Render:

**Build Command:**
```bash
cd server && npm install && npm run build
```

**Start Command:**
```bash
cd server && npm start
```

**Environment Variables:**
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your Render PostgreSQL connection string
- `SESSION_SECRET`: A secure random string
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `GOOGLE_CALENDAR_API_KEY`: Your Google Calendar API key
- `RENDER_EXTERNAL_URL`: Your Render service URL (e.g., `https://skedlyze.onrender.com`)

**Note:** The frontend will be automatically built and served by the backend server in production.

### 3. Google OAuth Configuration

**Important:** Update your Google OAuth configuration in the Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add these **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback` (for local development)
   - `https://your-app-name.onrender.com/api/auth/google/callback` (for production)

### 4. Database Setup

The application will automatically create the necessary database tables when it first connects to the database.

### 5. Quick Deploy with render.yaml

You can use the provided `render.yaml` file for automatic deployment:

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect the `render.yaml` file and create both services
4. Set the environment variables in the Render dashboard

## Environment Variables Reference

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALENDAR_API_KEY=your-google-calendar-api-key
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### OAuth Redirect URI Mismatch
- Ensure the callback URL in Google Cloud Console matches exactly
- For local development: `http://localhost:3000/api/auth/google/callback`
- For production: `https://your-domain.onrender.com/api/auth/google/callback`

### Database Connection Issues
- Verify the `DATABASE_URL` is correct
- Check that the database is accessible from Render's servers
- Ensure SSL is enabled for production connections

### CORS Issues
- The application automatically handles CORS for both development and production
- Frontend proxies API calls to backend in development
- Production uses separate domains with proper CORS configuration
