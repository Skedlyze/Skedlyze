# Skedlyze - Gamified Lifestyle App

A modern, gamified task management application that transforms daily productivity into an exciting adventure with rewards, achievements, and Google Calendar integration.

## 🎯 Features

### Core Features
- **Task Management**: Create, edit, and complete tasks with categories and priorities
- **Google OAuth**: Secure authentication using Google accounts
- **Google Calendar Integration**: Sync tasks to your Google Calendar automatically
- **Gamification System**: Earn experience points, level up, and unlock achievements
- **Progress Tracking**: Monitor your productivity with detailed statistics
- **Streak System**: Maintain daily streaks for bonus rewards

### Gamification Elements
- **Experience Points (XP)**: Earn XP for completing tasks
- **Level System**: Progress through levels as you gain experience
- **Achievements**: Unlock achievements for various milestones
- **Streak Tracking**: Maintain daily activity streaks
- **Progress Visualization**: Beautiful progress bars and statistics

### Technical Features
- **PERN Stack**: PostgreSQL, Express.js, React Native, Node.js
- **Real-time Updates**: Live synchronization between app and calendar
- **Responsive Design**: Modern UI with smooth animations
- **Cross-platform**: Works on iOS and Android via Expo

## 🏗️ Architecture

### Backend (Node.js + Express)
```
server/
├── config/
│   └── passport.js          # Google OAuth configuration
├── controllers/
│   ├── taskController.js    # Task CRUD operations
│   ├── userController.js    # User profile & stats
│   └── calendarController.js # Google Calendar integration
├── db/
│   ├── migrations/          # Database schema
│   └── seeds/              # Initial data
├── middleware/
│   └── isAuthenticated.js  # Auth middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── tasks.js            # Task routes
│   ├── users.js            # User routes
│   └── calendar.js         # Calendar routes
├── services/
│   └── achievementService.js # Gamification logic
└── server.js               # Main server file
```

### Frontend (React Native + Expo)
```
client/
├── src/
│   ├── components/         # Reusable components
│   ├── context/
│   │   └── AuthContext.js  # Authentication state
│   ├── screens/
│   │   ├── LoginScreen.js  # Google OAuth login
│   │   ├── HomeScreen.js   # Dashboard with stats
│   │   ├── TaskScreen.js   # Task management
│   │   ├── ProfileScreen.js # User profile & achievements
│   │   ├── CalendarScreen.js # Calendar integration
│   │   └── AchievementsScreen.js # Achievement gallery
│   ├── services/
│   │   └── api.js          # API client
│   └── utils/              # Helper functions
└── App.js                  # Main app component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Expo CLI
- Google Cloud Console account

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Skedlyze/Skedlyze.git
   cd Skedlyze/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   SESSION_SECRET=your-super-secret-session-key

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=skedlyze_dev
   DB_USER=postgres
   DB_PASSWORD=your-password

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Client Configuration
   CLIENT_URL=http://localhost:3000
   ```

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API and Google Calendar API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret to `.env`

5. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb skedlyze_dev

   # Run migrations
   npm run migrate

   # Seed initial data
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Install Expo Go app on your device
   - Scan the QR code from the terminal
   - Or press 'i' for iOS simulator, 'a' for Android emulator

## 📱 Usage

### Authentication
1. Open the app and tap "Continue with Google"
2. Sign in with your Google account
3. Grant permissions for calendar access

### Task Management
1. **Create Tasks**: Tap the "+" button to add new tasks
2. **Set Priority**: Choose low, medium, or high priority
3. **Categorize**: Select from work, personal, health, learning, social, or other
4. **Complete Tasks**: Tap the checkmark to complete and earn XP

### Calendar Integration
1. **Enable Sync**: Go to Profile → Settings → Calendar Sync
2. **Sync Tasks**: Tap "Sync Tasks" in the Calendar screen
3. **View Events**: Your tasks will appear in Google Calendar

### Gamification
- **Earn XP**: Complete tasks to gain experience points
- **Level Up**: Every 100 XP increases your level
- **Achievements**: Unlock achievements for milestones
- **Streaks**: Maintain daily activity for bonus rewards

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server
npm run migrate      # Run database migrations
npm run seed         # Seed database with initial data
npm run db:reset     # Reset database and reseed
```

**Frontend:**
```bash
npm start            # Start Expo development server
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator
npm run web          # Run in web browser
```

### Database Schema

**Users Table:**
- Basic profile information
- Google OAuth tokens
- Gamification data (level, XP, streaks)
- Preferences and settings

**Tasks Table:**
- Task details (title, description, priority)
- Scheduling information
- Completion status and timing
- Google Calendar integration

**Achievements Table:**
- Achievement definitions
- Requirements and rewards
- Different achievement types

**User_Achievements Table:**
- Junction table for earned achievements
- Timestamps and read status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `SESSION_SECRET` | Session encryption key | Yes |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `CLIENT_URL` | Frontend URL | Yes |

### Google API Setup

1. **Enable APIs:**
   - Google+ API
   - Google Calendar API

2. **OAuth 2.0 Configuration:**
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

3. **Scopes:**
   - `profile`
   - `email`
   - `https://www.googleapis.com/auth/calendar`

## 🚀 Deployment

### Backend Deployment

1. **Set up production database**
   ```bash
   # Update environment variables for production
   NODE_ENV=production
   DB_HOST=your-production-db-host
   ```

2. **Deploy to your preferred platform**
   - Heroku
   - DigitalOcean
   - AWS
   - Google Cloud Platform

3. **Run migrations**
   ```bash
   npm run migrate
   ```

### Frontend Deployment

1. **Build for production**
   ```bash
   expo build:android  # For Android
   expo build:ios      # For iOS
   ```

2. **Publish to app stores**
   - Google Play Store
   - Apple App Store

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

## 🎉 Acknowledgments

- Google OAuth and Calendar APIs
- Expo team for the amazing React Native platform
- The open-source community for inspiration and tools

---

**Made with ❤️ for productivity**