# Skedlyze - Gamified Lifestyle Web App

A modern, gamified task management web application that turns productivity into a game with rewards, achievements, and Google Calendar integration.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)  
- PostgreSQL (v12 or higher)  
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
```

### Frontend Setup

```bash
# 1. Navigate to web-client directory
cd ../web-client

# 2. Install frontend dependencies
npm install

# 3. Start Vite development server
npm run dev
```

### Running the Full Application

```bash
# From the root directory, run both server and client
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend web app on http://localhost:3000

---

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Database**: PostgreSQL with Knex.js ORM
- **Authentication**: Google OAuth 2.0 with Passport.js
- **API**: RESTful API with Express.js
- **Calendar Integration**: Google Calendar API

### Frontend (React + Vite)
- **Framework**: React 18 with hooks
- **UI Library**: Material-UI (MUI)
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios

---

## 📋 Features

### Task Management
- Create, edit, delete, and complete tasks
- Set priorities (low, medium, high)
- Categorize tasks (work, personal, health, learning, social)
- Set due dates and reminders
- Track completion time

### Gamification
- Experience points (XP) for completing tasks
- Level progression system
- Achievement system with badges
- Daily and weekly streaks
- Task completion statistics

### Google Calendar Integration
- Sync tasks to Google Calendar
- Import calendar events as tasks
- Two-way synchronization
- Calendar event management

### User Experience
- Modern, responsive web interface
- Real-time task updates
- Progress tracking and analytics
- Onboarding flow for new users
- Achievement notifications

---

## 🗄️ Database Schema

### Users Table
- Basic profile information
- Google OAuth integration
- Gamification stats (level, XP, streaks)
- Preferences and settings

### Tasks Table
- Task details (title, description, priority)
- Scheduling (due date, start/end time)
- Status tracking (pending, in progress, completed)
- Google Calendar integration fields
- Gamification fields (XP reward, completion time)

### Achievements Table
- Achievement definitions
- Unlock conditions
- XP rewards

### User Achievements Table
- User achievement progress
- Unlock dates
- Completion status

---

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Database operations
npm run migrate    # Run migrations
npm run seed       # Seed database
npm run db:reset   # Reset database

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the server directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skedlyze_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session
SESSION_SECRET=your_session_secret

# Environment
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations and seeds
4. Deploy to your preferred hosting service

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web hosting service

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the ISC License.
