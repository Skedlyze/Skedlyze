# Google OAuth Setup Guide

## 🔧 Setting Up Google OAuth for Skedlyze

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Calendar API

### Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Skedlyze"
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar`

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://skedlyze.onrender.com/api/auth/google/callback` (for production)

### Step 4: Update Environment Variables

Update your `server/.env` file with the credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
# Note: Callback URL is automatically determined based on NODE_ENV
# - Development: http://localhost:5000/api/auth/google/callback
# - Production: https://skedlyze.onrender.com/api/auth/google/callback
```

### Step 5: Restart the Server

After updating the environment variables, restart your server:

```bash
cd server
npm run dev
```

## 🚀 Environment-Specific Setup

### Development (Localhost)
```bash
NODE_ENV=development
# The app will automatically use: http://localhost:5000/api/auth/google/callback
```

### Production (Render)
```bash
NODE_ENV=production
# The app will automatically use: https://skedlyze.onrender.com/api/auth/google/callback
```

### Testing Configuration
Run the test script to verify your setup:
```bash
cd server
node test-oauth.js
```

## ✅ Verification

Once set up correctly:
1. The server should show "Google OAuth configured" instead of "Google OAuth not configured"
2. The login page will show "Continue with Google" button
3. Clicking the button will redirect to Google's OAuth flow

## 🔒 Security Notes

- Never commit your actual Google OAuth credentials to version control
- Use environment variables for all sensitive information
- For production, use HTTPS URLs in your redirect URIs
- Regularly rotate your OAuth credentials

## 🆘 Troubleshooting

### Common Issues:

1. **"Google OAuth not configured"**
   - Check that your environment variables are set correctly
   - Make sure the values are not the placeholder text

2. **"Redirect URI mismatch"**
   - Verify the redirect URI in Google Cloud Console matches your .env file
   - Check for trailing slashes or protocol mismatches

3. **"Invalid client"**
   - Ensure your Google Cloud project is active
   - Verify the OAuth consent screen is configured

4. **"Access blocked"**
   - Add your email to the test users in OAuth consent screen (for external apps)
   - Or publish your app for production use 