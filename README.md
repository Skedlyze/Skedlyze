## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)  
- PostgreSQL (v12 or higher)  
- Expo CLI  
- Google Cloud Console account  

---

### Backend Setup

```bash
# 1. Clone the repo and navigate to backend
git clone https://github.com/Skedlyze/Skedlyze.git
cd Skedlyze/server

# 2. Install backend dependencies
npm install

# 3. Copy environment example and edit .env
cp env.example .env
# Then open .env in your editor and update DB and Google OAuth info

# 4. Create PostgreSQL database
createdb skedlyze_dev

# 5. Run migrations
npm run migrate

# 6. Seed initial data
npm run seed

# 7. Start development server
npm run dev
Frontend Setup
bash
Copy
Edit
# 1. Navigate to client directory
cd ../client

# 2. Install frontend dependencies
npm install

# 3. Start Expo development server
npm start
Running on Device/Simulator
Install the Expo Go app on your mobile device

Scan the QR code shown in the terminal or Expo web page

Or press i to open iOS simulator, a to open Android emulator (if set up)

pgsql
Copy
Edit

That’s it — a neat copy-paste ready section for your README with no fragmentation! Want me to do this for any other sections?







You said:
still keep the other parts like usage overview


ChatGPT said:
Got it! Here's the full README including setup, usage, and overview — all properly formatted and ready for easy copy-paste in one go:

markdown
Copy
Edit
# Skedlyze - Gamified Lifestyle App

A modern, gamified task management app that turns productivity into a game with rewards, achievements, and Google Calendar integration.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)  
- PostgreSQL (v12 or higher)  
- Expo CLI  
- Google Cloud Console account  

---

### Backend Setup

```bash
# Clone the repo and navigate to backend
git clone https://github.com/Skedlyze/Skedlyze.git
cd Skedlyze/server

# Install dependencies
npm install

# Copy environment file and edit it with your config
cp env.example .env
# Edit .env to set DB and Google OAuth details

# Create PostgreSQL database
createdb skedlyze_dev

# Run database migrations
npm run migrate

# Seed initial data
npm run seed

# Start backend development server
npm run dev
Frontend Setup
bash
Copy
Edit
# Move to client directory
cd ../client

# Install frontend dependencies
npm install

# Start Expo development server
npm start
Running on Device or Simulator
Install Expo Go on your mobile device

Scan the QR code shown in your terminal or Expo DevTools

Or press i for iOS simulator, a for Android emulator (if configured)

📱 Usage Overview
Authentication
Launch the app and tap "Continue with Google"

Sign in with your Google account

Allow calendar access permission

Task Management
Tap the "+" button to create new tasks

Assign priority (low, medium, high) and categories (work, personal, health, etc.)

Complete tasks to earn experience points (XP) and level up

Calendar Integration
Enable calendar sync in Profile → Settings → Calendar Sync

Sync your tasks to Google Calendar from the Calendar screen

View and manage tasks alongside your events

Gamification
Earn XP by completing tasks

Level up every 100 XP gained

Unlock achievements for milestones

Keep daily streaks for bonus rewards

🏗️ Architecture
Backend
Node.js + Express server

PostgreSQL database with Knex.js migrations/seeds

Google OAuth with Passport.js

RESTful API for auth, tasks, users, calendar, and gamification

Frontend
React Native with Expo

Google OAuth flow

Gamified UI with progress bars and achievements

Cross-platform support (iOS & Android)

🛠️ Available Scripts
Backend
bash
Copy
Edit
npm run dev          # Start development server
npm run migrate      # Run migrations
npm run seed         # Seed database
npm run db:reset     # Reset database and reseed
Frontend
bash
Copy
Edit
npm start            # Start Expo server
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator
npm run web          # Run in web browser
🔧 Environment Variables
Variable	Description	Required
NODE_ENV	Environment (development/production)	Yes
PORT	Server port	No (default: 5000)
SESSION_SECRET	Session encryption key	Yes
DB_HOST	PostgreSQL host	Yes
DB_NAME	Database name	Yes
DB_USER	Database username	Yes
DB_PASSWORD	Database password	Yes
GOOGLE_CLIENT_ID	Google OAuth client ID	Yes
GOOGLE_CLIENT_SECRET	Google OAuth client secret	Yes
GOOGLE_CALLBACK_URL	OAuth callback URL	Yes
CLIENT_URL	Frontend URL	Yes

📄 License
This project is licensed under the ISC License.

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/your-feature)

Commit your changes (git commit -m 'Add feature')

Push to your branch (git push origin feature/your-feature)

Open a Pull Request

🆘 Support
If you have any issues or questions, please create an issue on GitHub or check the documentation.
