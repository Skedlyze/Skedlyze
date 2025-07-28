import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import {
  EmojiEvents,
  CheckCircle,
  Lock,
  Star,
} from '@mui/icons-material'
import axios from 'axios'

function AchievementsPage() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/users/achievements')
        setAchievements(response.data)
      } catch (err) {
        console.error('Error fetching achievements:', err)
        setError('Failed to load achievements')
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
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

  const unlockedCount = achievements.filter(a => a.is_unlocked).length
  const totalCount = achievements.length
  const totalXpEarned = achievements.filter(a => a.is_unlocked).reduce((sum, a) => sum + (a.experience_reward || 0), 0)

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Achievements
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {unlockedCount}/{totalCount}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Achievements Unlocked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {totalXpEarned}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total XP Earned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {((unlockedCount / totalCount) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Achievements List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Achievements
          </Typography>
          <List>
            {achievements.map((achievement) => (
              <ListItem key={achievement.id} divider sx={{ py: 2 }}>
                <ListItemIcon>
                  <Typography variant="h4">{achievement.icon}</Typography>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {achievement.name}
                      </Typography>
                      <Chip
                        label={`${achievement.experience_reward || 0} XP`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {achievement.description}
                      </Typography>
                      {achievement.is_unlocked ? (
                        <Typography variant="caption" color="success.main">
                          Unlocked on {new Date(achievement.earned_at).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          Not unlocked yet
                        </Typography>
                      )}
                    </>
                  }
                />
                <Box display="flex" alignItems="center">
                  {achievement.is_unlocked ? (
                    <CheckCircle color="success" sx={{ fontSize: 32 }} />
                  ) : (
                    <Lock color="action" sx={{ fontSize: 32 }} />
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AchievementsPage 