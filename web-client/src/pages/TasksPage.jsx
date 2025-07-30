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
} from '@mui/material'
import { Add, Work, FitnessCenter, Person, School, Delete } from '@mui/icons-material'
import { taskService } from '../services/taskService'

const categories = [
  { value: 'work', label: 'Work', icon: <Work /> },
  { value: 'health', label: 'Health', icon: <FitnessCenter /> },
  { value: 'personal', label: 'Personal', icon: <Person /> },
  { value: 'learning', label: 'Learning', icon: <School /> },
]

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
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
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      if (task.is_completed) {
        // If already completed, uncomplete it
        const response = await taskService.update(taskId, { 
          is_completed: false, 
          status: 'pending',
          completed_at: null 
        })
        
        // Show XP deduction feedback
        if (response.experienceLost) {
          setError(`Task unchecked! -${response.experienceLost} XP${response.levelDown ? ' (Level down!)' : ''}`)
          setTimeout(() => setError(null), 3000)
        }
      } else {
        // Complete the task
        const response = await taskService.complete(taskId)
        
        // Show XP gain feedback
        if (response.experienceGained) {
          setSuccess(`Task completed! +${response.experienceGained} XP${response.levelUp ? ' (Level up!)' : ''}`)
          setTimeout(() => setSuccess(null), 3000)
        }
      }
      
      // Reload tasks to get updated data
      await loadTasks()
    } catch (err) {
      console.error('Error toggling task:', err)
      setError('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.delete(taskId)
      await loadTasks()
    } catch (err) {
      console.error('Error deleting task:', err)
      setError('Failed to delete task. Please try again.')
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title is required')
      return
    }

    try {
      setError(null)
      await taskService.create(newTask)
      setNewTask({ 
        title: '', 
        description: '',
        priority: 'medium', 
        category: 'personal', 
        due_date: '' 
      })
      setOpenDialog(false)
      await loadTasks()
    } catch (err) {
      console.error('Error creating task:', err)
      setError('Failed to create task. Please try again.')
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

  const getCategoryIcon = (category) => {
    return categories.find(cat => cat.value === category)?.icon || <Work />
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString()
  }

  const completedTasks = tasks.filter(task => task.is_completed).length
  const totalTasks = tasks.length

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
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          My Tasks
        </Typography>
        <Typography variant="h6" color="textSecondary">
          {completedTasks} of {totalTasks} completed
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {tasks.length === 0 ? (
            <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
              No tasks yet. Create your first task to get started!
            </Typography>
          ) : (
            <List>
              {tasks.map((task) => (
                <ListItem key={task.id} divider>
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
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {task.description && (
                          <Typography variant="body2" color="textSecondary">
                            {task.description}
                          </Typography>
                        )}
                        <Typography variant="body2" color="textSecondary">
                          Due: {formatDate(task.due_date)}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          {task.is_completed ? '✓ Completed' : `+${task.experience_reward || 10} XP`}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                    {getCategoryIcon(task.category)}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteTask(task.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Fab
        color="primary"
        aria-label="add"
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
                label="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (optional)"
                multiline
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Priority"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
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
                label="Due Date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
    </Box>
  )
}

export default TasksPage 