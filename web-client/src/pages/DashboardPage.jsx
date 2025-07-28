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
  Alert,
} from '@mui/material'
import {
  TrendingUp,
  Task,
  EmojiEvents,
  LocalFireDepartment,
  CheckCircle,
  Schedule,
  Star,
  Celebration,
  RocketLaunch,
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
        setError('Oops! Something went wrong while loading your dashboard. Give it another try?')
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
        <Alert severity="error">{error}</Alert>
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

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivationalMessage = () => {
    if (stats.streak > 7) {
      return `🔥 Amazing! You're on a ${stats.streak}-day streak! Keep up the incredible work!`
    } else if (stats.streak > 3) {
      return `🔥 Nice! You've been consistent for ${stats.streak} days. You're building great habits!`
    } else if (stats.completionRate > 80) {
      return `🎯 You're crushing it with a ${taskCompletionRate.toFixed(0)}% completion rate!`
    } else if (stats.totalTasks > 0) {
      return `💪 You've created ${stats.totalTasks} tasks so far. Every step counts!`
    } else {
      return `🚀 Ready to get started? Create your first task and begin your productivity journey!`
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
        {getWelcomeMessage()}, {user?.name}! 👋
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {getMotivationalMessage()}
      </Typography>

      {/* Level Progress */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Level {stats.level}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {stats.xp} / {stats.nextLevelXp} XP
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <RocketLaunch />
            </Avatar>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }} 
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.9 }}>
            {stats.nextLevelXp - stats.xp} XP to next level
          </Typography>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tasks Created
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalTasks}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.totalTasks === 0 ? 'Start building your list!' : 'You\'re getting organized!'}
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
                    {taskCompletionRate.toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {taskCompletionRate > 80 ? 'Outstanding!' : taskCompletionRate > 60 ? 'Great progress!' : 'Keep going!'}
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
                  <Typography variant="body2" color="textSecondary">
                    {stats.streak === 0 ? 'Start your streak today!' : 'You\'re on fire! 🔥'}
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
                  <Typography variant="body2" color="textSecondary">
                    {stats.achievements === 0 ? 'Unlock your first one!' : 'Keep earning those badges!'}
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

      {/* Recent Tasks */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                Recent Tasks
              </Typography>
              {recentTasks.length === 0 ? (
                <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                  No recent tasks yet. Create your first task to see it here!
                </Typography>
              ) : (
                <List>
                  {recentTasks.slice(0, 5).map((task) => (
                    <ListItem key={task.id} dense>
                      <ListItemIcon>
                        <CheckCircle 
                          color={task.is_completed ? 'success' : 'disabled'} 
                          fontSize="small" 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: task.is_completed ? 'line-through' : 'none',
                              color: task.is_completed ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {task.title}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <span>{getCategoryIcon(task.category)}</span>
                            <Chip
                              label={task.priority}
                              color={getPriorityColor(task.priority)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Celebration />
                Recent Achievements
              </Typography>
              {achievements.length === 0 ? (
                <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
                  Complete tasks to unlock achievements and earn badges!
                </Typography>
              ) : (
                <List>
                  {achievements.map((achievement) => (
                    <ListItem key={achievement.id} dense>
                      <ListItemIcon>
                        <Star color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={achievement.name}
                        secondary={achievement.description}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage 