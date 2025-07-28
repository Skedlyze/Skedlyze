import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Chip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material'
import { 
  Add, 
  Work, 
  FitnessCenter, 
  Person, 
  School, 
  Delete, 
  Event,
  PriorityHigh,
  CheckCircle,
  Schedule
} from '@mui/icons-material'
import { taskService } from '../services/taskService'

const categories = [
  { value: 'work', label: 'Work', icon: <Work />, color: '#1976d2' },
  { value: 'health', label: 'Health & Fitness', icon: <FitnessCenter />, color: '#2e7d32' },
  { value: 'personal', label: 'Personal', icon: <Person />, color: '#ed6c02' },
  { value: 'learning', label: 'Learning', icon: <School />, color: '#9c27b0' },
]

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    due_date: '',
  })

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const tasksData = await taskService.getAll()
      setTasks(tasksData)
    } catch (err) {
      console.error('Error loading tasks:', err)
      setError('Oops! Something went wrong while loading your tasks. Give it another try?')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      if (task.is_completed) {
        // If already completed, uncomplete it
        await taskService.update(taskId, { 
          is_completed: false, 
          status: 'pending',
          completed_at: null 
        })
        showSnackbar('Task marked as incomplete - no worries, you can always try again!', 'info')
      } else {
        // Complete the task
        const result = await taskService.complete(taskId)
        const xpGained = result.experienceGained || 10
        showSnackbar(`Great job! You earned ${xpGained} XP for completing this task! 🎉`, 'success')
      }
      
      // Reload tasks to get updated data
      await loadTasks()
    } catch (err) {
      console.error('Error toggling task:', err)
      showSnackbar('Hmm, something went wrong there. Try again?', 'error')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId)
      await loadTasks()
      showSnackbar('Task removed from your list', 'info')
    } catch (err) {
      console.error('Error deleting task:', err)
      showSnackbar('Couldn\'t delete that task right now. Try again?', 'error')
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      showSnackbar('Hey, you need to give your task a name!', 'warning')
      return
    }

    try {
      setError(null)
      const createdTask = await taskService.create(newTask)
      setNewTask({ 
        title: '', 
        description: '',
        priority: 'medium', 
        category: 'personal', 
        due_date: '' 
      })
      setOpenDialog(false)
      await loadTasks()
      
      // Check if task was synced to calendar
      if (createdTask.synced_to_calendar) {
        showSnackbar('Task created and added to your Skedlyze Calendar! 📅', 'success')
      } else {
        showSnackbar('Task added to your list!', 'success')
      }
    } catch (err) {
      console.error('Error creating task:', err)
      showSnackbar('Oops! Couldn\'t create that task. Try again?', 'error')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <PriorityHigh fontSize="small" />
      case 'medium': return <Schedule fontSize="small" />
      case 'low': return <CheckCircle fontSize="small" />
      default: return <Schedule fontSize="small" />
    }
  }

  const getCategoryIcon = (category) => {
    return categories.find(cat => cat.value === category)?.icon || <Work />
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline set'
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Due today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Due tomorrow'
    } else {
      return `Due ${date.toLocaleDateString()}`
    }
  }

  const isOverdue = (dateString) => {
    if (!dateString) return false
    return new Date(dateString) < new Date() && new Date(dateString).toDateString() !== new Date().toDateString()
  }

  const completedTasks = tasks.filter(task => task.is_completed).length
  const totalTasks = tasks.length
  const overdueTasks = tasks.filter(task => isOverdue(task.due_date) && !task.is_completed).length

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            My Tasks
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {completedTasks} of {totalTasks} completed
            {overdueTasks > 0 && (
              <span style={{ color: '#d32f2f', marginLeft: 8 }}>
                • {overdueTasks} overdue
              </span>
            )}
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          {tasks.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary" mb={2}>
                No tasks yet
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Ready to get organized? Create your first task to start building better habits!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
              >
                Create Your First Task
              </Button>
            </Box>
          ) : (
            <List>
              {tasks.map((task) => (
                <ListItem 
                  key={task.id} 
                  divider
                  sx={{
                    backgroundColor: task.is_completed ? '#f8f9fa' : 'transparent',
                    opacity: task.is_completed ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: task.is_completed ? '#f1f3f4' : '#f8f9fa'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.is_completed}
                      onChange={() => handleToggleTask(task.id)}
                      color="primary"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          textDecoration: task.is_completed ? 'line-through' : 'none',
                          color: task.is_completed ? 'text.secondary' : 'text.primary',
                          fontWeight: task.is_completed ? 'normal' : 500,
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box mt={1}>
                        {task.description && (
                          <Typography variant="body2" color="textSecondary" mb={1}>
                            {task.description}
                          </Typography>
                        )}
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography 
                            variant="body2" 
                            color={isOverdue(task.due_date) ? '#d32f2f' : 'textSecondary'}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <Event fontSize="small" />
                            {formatDate(task.due_date)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <Box display="flex" gap={1} alignItems="center">
                    <Tooltip title={`${task.priority} priority`}>
                      <Chip
                        icon={getPriorityIcon(task.priority)}
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                    <Tooltip title={categories.find(cat => cat.value === task.category)?.label}>
                      <Box sx={{ color: categories.find(cat => cat.value === task.category)?.color }}>
                        {getCategoryIcon(task.category)}
                      </Box>
                    </Tooltip>
                    <Tooltip title="Delete task">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTask(task.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}
      >
        <Add />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="What do you need to do?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                placeholder="e.g., Finish project report, Call mom, Go for a run"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="More details (optional)"
                multiline
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add any notes or context that might help..."
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>How important is this?</InputLabel>
                <Select
                  value={newTask.priority}
                  label="How important is this?"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <MenuItem value="low">Low - No rush</MenuItem>
                  <MenuItem value="medium">Medium - Important</MenuItem>
                  <MenuItem value="high">High - Urgent!</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTask.category}
                  label="Category"
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="When is this due?"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Tasks with due dates will be added to your Skedlyze Calendar"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default TasksPage 