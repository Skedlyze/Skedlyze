import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  Star,
  EmojiEvents,
  TrendingUp,
  LocalFireDepartment,
  CheckCircle,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function ProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [profileResponse, achievementsResponse] = await Promise.all([
          axios.get('/api/users/profile'),
          axios.get('/api/users/achievements')
        ])

        const profileData = profileResponse.data
        const achievementsData = achievementsResponse.data

        setStats({
          level: profileData.level || 1,
          xp: profileData.experience_points || 0,
          nextLevelXp: (100 - (profileData.experience_points || 0) % 100) + (profileData.experience_points || 0),
          totalTasks: profileData.total_tasks_created || 0,
          completedTasks: profileData.total_tasks_completed || 0,
          streak: profileData.streak_days || 0,
          achievements: achievementsData.filter(a => a.is_unlocked).length || 0,
        })
        setAchievements(achievementsData.filter(a => a.is_unlocked).slice(0, 4))
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError('Failed to load profile data')
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

  const progressPercentage = (stats.xp / stats.nextLevelXp) * 100

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* User Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {user?.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {user?.email}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
                  Level {stats.level}
                </Typography>
                <Star sx={{ color: 'secondary.main', fontSize: 24 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {stats.totalTasks}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {stats.completedTasks}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      {stats.streak}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Day Streak
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      {stats.achievements}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Achievements
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Level Progress */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Level Progress
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {stats.xp} / {stats.nextLevelXp} XP
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{ height: 12, borderRadius: 6 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {stats.nextLevelXp - stats.xp} XP until Level {stats.level + 1}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Achievements
              </Typography>
              <List>
                {achievements.map((achievement) => (
                  <ListItem key={achievement.id} divider>
                    <ListItemIcon>
                      <Typography variant="h5">🏆</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">{achievement.description}</Typography>
                          {achievement.is_unlocked && (
                            <Typography variant="caption" color="success.main">
                              Unlocked on {new Date(achievement.earned_at).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      label={achievement.is_unlocked ? 'Unlocked' : 'Locked'}
                      color={achievement.is_unlocked ? 'success' : 'default'}
                      icon={achievement.is_unlocked ? <CheckCircle /> : <EmojiEvents />}
                    />
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

export default ProfilePage 