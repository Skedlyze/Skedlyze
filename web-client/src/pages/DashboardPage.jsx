import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Paper,
  CircularProgress,
} from '@mui/material'
import {
  TrendingUp,
  Task,
  EmojiEvents,
  LocalFireDepartment,
  CheckCircle,
  Schedule,
  Star,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Update streak on dashboard access (daily login check)
        try {
          await axios.get('/api/users/profile')
        } catch (streakError) {
          console.error('Error updating streak on dashboard access:', streakError)
        }
        
        const [statsResponse, achievementsResponse] = await Promise.all([
          axios.get('/api/users/stats'),
          axios.get('/api/users/achievements')
        ])

        const statsData = statsResponse.data
        const achievementsData = achievementsResponse.data


        setStats({
          totalTasks: statsData.user.total_tasks_created || 0,
          completedTasks: statsData.user.total_tasks_completed || 0,
          streak: statsData.user.streak_days || 0,
          level: statsData.user.level || 1,
          xp: statsData.user.experience_points || 0,
          nextLevelXp: (statsData.experienceToNextLevel || 100) + (statsData.user.experience_points || 0),
          achievements: achievementsData.filter(a => a.is_unlocked).length || 0,
          completionRate: statsData.completionRate || 0
        })
        setRecentTasks(statsData.recentTasks || [])
        setAchievements(achievementsData.filter(a => a.is_unlocked).slice(0, 3))
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  if (!stats) {
    return null
  }

  const progressPercentage = stats.xp && stats.nextLevelXp ? (stats.xp / stats.nextLevelXp) * 100 : 0
  const taskCompletionRate = typeof stats.completionRate === 'number' ? stats.completionRate : 0
  


  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼'
      case 'health': return '🏃‍♂️'
      case 'personal': return '👤'
      case 'learning': return '📚'
      default: return '📝'
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Welcome back, {user?.name}! 👋
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalTasks}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Task />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {taskCompletionRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Current Streak
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.streak} days
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LocalFireDepartment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Achievements
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.achievements}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <EmojiEvents />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Level Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Level Progress
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mr: 1 }}>
                  Level {stats.level}
                </Typography>
                <Star sx={{ color: 'secondary.main', fontSize: 32 }} />
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {stats.xp} / {stats.nextLevelXp} XP
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {stats.nextLevelXp - stats.xp} XP until next level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>
              <List dense>
                {achievements.map((achievement) => (
                  <ListItem key={achievement.id}>
                    <ListItemIcon>
                      <Typography variant="h6">🏆</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.name}
                      secondary={achievement.description}
                    />
                    <Chip
                      label={achievement.is_unlocked ? 'Unlocked' : 'Locked'}
                      color={achievement.is_unlocked ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Tasks
              </Typography>
              <List>
                {recentTasks.map((task) => (
                  <ListItem key={task.id} divider>
                    <ListItemIcon>
                      {task.is_completed ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Schedule color="action" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.title}
                      secondary={`${task.category} • ${task.priority} priority`}
                    />
                    <Box display="flex" gap={1}>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                      <Typography variant="h6">
                        {getCategoryIcon(task.category)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage 