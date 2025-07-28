# Skedlyze Database Schema

## Overview
This document describes the database schema for Skedlyze, showing how user-specific gamification data is stored and isolated between users.

## Database Tables

### 1. `users` Table
**Purpose**: Core user authentication and profile information
**Unique Identifier**: `google_id` (from Google OAuth)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR UNIQUE NOT NULL,  -- Google's unique user ID
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  picture VARCHAR,
  access_token VARCHAR,
  refresh_token VARCHAR,
  token_expires_at TIMESTAMP,
  
  -- Legacy fields (kept for backward compatibility)
  level INTEGER DEFAULT 0,
  experience_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_tasks_completed INTEGER DEFAULT 0,
  total_tasks_created INTEGER DEFAULT 0,
  
  preferences JSONB DEFAULT '{}',
  calendar_sync_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. `user_gamification_data` Table ⭐ **NEW**
**Purpose**: Dedicated table for all user-specific gamification data
**Unique Identifier**: `user_id` (foreign key to users.id)

```sql
CREATE TABLE user_gamification_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Core gamification stats
  level INTEGER DEFAULT 0 NOT NULL,
  experience_points INTEGER DEFAULT 0 NOT NULL,
  total_experience_earned INTEGER DEFAULT 0 NOT NULL,
  
  -- Streak tracking
  current_streak_days INTEGER DEFAULT 0 NOT NULL,
  longest_streak_days INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  streak_start_date DATE,
  
  -- Task statistics
  total_tasks_created INTEGER DEFAULT 0 NOT NULL,
  total_tasks_completed INTEGER DEFAULT 0 NOT NULL,
  tasks_completed_today INTEGER DEFAULT 0 NOT NULL,
  tasks_completed_this_week INTEGER DEFAULT 0 NOT NULL,
  tasks_completed_this_month INTEGER DEFAULT 0 NOT NULL,
  
  -- Achievement tracking
  total_achievements_earned INTEGER DEFAULT 0 NOT NULL,
  unlocked_achievements JSONB DEFAULT '[]' NOT NULL, -- Array of achievement IDs
  
  -- Progress tracking
  completion_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL, -- Percentage
  consecutive_days_active INTEGER DEFAULT 0 NOT NULL,
  first_login_date DATE,
  
  -- Game state
  current_quests JSONB DEFAULT '[]' NOT NULL, -- Active quests
  completed_quests JSONB DEFAULT '[]' NOT NULL, -- Completed quests
  inventory JSONB DEFAULT '{}' NOT NULL, -- User's virtual items
  badges JSONB DEFAULT '[]' NOT NULL, -- Earned badges
  
  -- Performance metrics
  average_task_completion_time DECIMAL(8,2), -- in minutes
  fastest_task_completion_minutes INTEGER,
  longest_task_completion_minutes INTEGER,
  
  -- Category-specific stats
  category_stats JSONB DEFAULT '{}' NOT NULL, -- Stats per category
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. `tasks` Table
**Purpose**: User-specific tasks
**Unique Identifier**: `id` + `user_id` (each task belongs to one user)

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  category ENUM('work', 'personal', 'health', 'learning', 'social', 'other') DEFAULT 'other',
  
  -- Scheduling
  due_date TIMESTAMP,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  all_day BOOLEAN DEFAULT FALSE,
  
  -- Gamification
  experience_reward INTEGER DEFAULT 10,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  completion_time_minutes INTEGER,
  
  -- Google Calendar integration
  google_calendar_event_id VARCHAR,
  synced_to_calendar BOOLEAN DEFAULT FALSE,
  
  -- Recurring tasks
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR, -- RRULE format
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. `achievements` Table
**Purpose**: Global achievement definitions (same for all users)
**Unique Identifier**: `id`

```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR,
  type ENUM('task_completion', 'streak', 'level_up', 'special') NOT NULL,
  requirement_value INTEGER NOT NULL, -- e.g., 10 tasks, 7 day streak
  experience_reward INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. `user_achievements` Table
**Purpose**: User-specific achievement unlocks
**Unique Identifier**: `user_id` + `achievement_id` (junction table)

```sql
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  
  -- Ensure a user can only earn an achievement once
  UNIQUE(user_id, achievement_id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Data Isolation Examples

### Example 1: User A vs User B Gamification Data
```json
// User A (ID: 1) - New user
{
  "user_id": 1,
  "level": 0,
  "experience_points": 0,
  "total_experience_earned": 0,
  "current_streak_days": 0,
  "total_tasks_created": 0,
  "total_tasks_completed": 0,
  "completion_rate": 0.00,
  "unlocked_achievements": []
}

// User B (ID: 2) - Active user
{
  "user_id": 2,
  "level": 5,
  "experience_points": 450,
  "total_experience_earned": 450,
  "current_streak_days": 7,
  "total_tasks_created": 25,
  "total_tasks_completed": 20,
  "completion_rate": 80.00,
  "unlocked_achievements": [1, 3, 5]
}
```

### Example 2: Task Isolation
```json
// User A's tasks
[
  {"id": 1, "user_id": 1, "title": "Learn React", "is_completed": false},
  {"id": 2, "user_id": 1, "title": "Exercise", "is_completed": true}
]

// User B's tasks
[
  {"id": 3, "user_id": 2, "title": "Project meeting", "is_completed": true},
  {"id": 4, "user_id": 2, "title": "Read book", "is_completed": false}
]
```

### Example 3: Achievement Unlocks
```json
// User A's achievements
[
  {"user_id": 1, "achievement_id": 1, "earned_at": "2024-01-15T10:30:00Z"}
]

// User B's achievements
[
  {"user_id": 2, "achievement_id": 1, "earned_at": "2024-01-10T09:15:00Z"},
  {"user_id": 2, "achievement_id": 3, "earned_at": "2024-01-12T14:20:00Z"},
  {"user_id": 2, "achievement_id": 5, "earned_at": "2024-01-14T16:45:00Z"}
]
```

## Key Features

### ✅ **Complete User Data Isolation**
- Every user has their own `user_gamification_data` record
- All tasks are linked to specific users via `user_id`
- All achievements are user-specific via `user_achievements` table
- No shared state between users

### ✅ **Persistent Data Storage**
- All gamification data is stored in the database
- No hardcoded values or local state
- Data persists across sessions and server restarts

### ✅ **Google OAuth Integration**
- Uses Google's unique `google_id` as the primary identifier
- Automatically creates gamification data on first login
- Maintains user identity across sessions

### ✅ **Comprehensive Tracking**
- Experience points and level progression
- Streak tracking with longest streak history
- Task completion statistics
- Category-specific performance
- Achievement unlocks
- Performance metrics

### ✅ **Scalable Architecture**
- Separate gamification data table for performance
- JSONB fields for flexible data storage
- Proper indexing on user_id for fast queries
- Cascade deletes for data integrity

## API Endpoints

### User Gamification Data
- `GET /api/users/stats` - Get user's gamification statistics
- `GET /api/users/achievements` - Get user's unlocked achievements

### Task Management
- `POST /api/tasks` - Create task (updates gamification data)
- `PATCH /api/tasks/:id/complete` - Complete task (awards XP, updates stats)

### Achievement System
- Automatic achievement checking on task completion
- Achievement unlocks stored in `user_achievements` table
- User-specific achievement progress tracking

## Data Flow Example

1. **User signs in via Google OAuth**
   - Google provides unique `google_id`
   - System creates/retrieves user record
   - System initializes `user_gamification_data` if new user

2. **User creates a task**
   - Task stored in `tasks` table with `user_id`
   - `user_gamification_data.total_tasks_created` incremented
   - Category stats updated

3. **User completes a task**
   - Task marked as completed in `tasks` table
   - XP awarded via `GamificationService.addExperience()`
   - Level calculated and updated
   - Streak updated
   - Achievement checks triggered
   - All stats updated in `user_gamification_data`

4. **User views their progress**
   - All data retrieved from `user_gamification_data` table
   - User-specific statistics displayed
   - No shared data between users

This architecture ensures complete data isolation, persistent storage, and scalable performance for the gamification system. 