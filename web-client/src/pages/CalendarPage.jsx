import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Avatar,
  Badge,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  Event,
  Add,
  Edit,
  Delete,
  LocationOn,
  Schedule,
  Refresh,
  Today,
  CalendarToday,
  AccessTime,
  ViewDay,
  ViewWeek,
  ViewModule,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  Settings,
} from '@mui/icons-material';
import calendarService from '../services/calendarService';

// Daily View Component
const DailyView = ({ events, onEventClick, getEventColor, formatEventTime }) => {
  const today = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getEventsForHour = (hour) => {
    return events.filter(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      return eventStart.getHours() === hour;
    });
  };

  return (
    <Box sx={{ height: '70vh', overflow: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        {today.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Typography>
      
      <Grid container spacing={0}>
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          return (
            <Grid item xs={12} key={hour}>
              <Box sx={{ 
                display: 'flex', 
                borderBottom: '1px solid #e0e0e0',
                minHeight: 60,
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}>
                <Box sx={{ 
                  width: 80, 
                  p: 1, 
                  borderRight: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 1, position: 'relative' }}>
                  {hourEvents.map((event, index) => (
                    <Card
                      key={`${event.id}-${index}`}
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        backgroundColor: getEventColor(event),
                        color: 'white',
                        '&:hover': { opacity: 0.8 }
                      }}
                      onClick={() => onEventClick(event)}
                    >
                      <CardContent sx={{ p: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="body2" fontWeight="bold" noWrap sx={{ flex: 1 }}>
                            {event.summary || 'Untitled Event'}
                          </Typography>
                          {event.calendarSummary && (
                            <Chip 
                              label={event.calendarSummary} 
                              size="small" 
                              sx={{ 
                                ml: 1, 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '0.6rem'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {formatEventTime(event)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// Weekly View Component
const WeeklyView = ({ events, onEventClick, getEventColor, formatEventTime }) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const timeSlots = [
    '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'
  ];

  return (
    <Box sx={{ height: '80vh', overflow: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        Week of {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Typography>
      
      <Paper sx={{ height: 'calc(100% - 100px)', overflow: 'auto' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Time column */}
          <Grid item xs={1} sx={{ borderRight: '1px solid #e0e0e0' }}>
            <Box sx={{ 
              height: 80, 
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              fontWeight: 'bold'
            }}>
              <Typography variant="body2" color="text.secondary">
                Time
              </Typography>
            </Box>
            {timeSlots.map((time, index) => (
              <Box
                key={time}
                sx={{
                  height: 60,
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa'
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {time}
                </Typography>
              </Box>
            ))}
          </Grid>

          {/* Days columns */}
          {days.map((day, dayIndex) => (
            <Grid item xs key={dayIndex} sx={{ borderRight: dayIndex < 6 ? '1px solid #e0e0e0' : 'none' }}>
              {/* Day header */}
              <Box sx={{ 
                height: 80, 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: day.toDateString() === today.toDateString() ? 'primary.light' : '#f8f9fa',
                color: day.toDateString() === today.toDateString() ? 'white' : 'inherit'
              }}>
                <Typography variant="body2" fontWeight="bold">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {day.getDate()}
                </Typography>
              </Box>

              {/* Time slots */}
              {timeSlots.map((time, timeIndex) => {
                const hour = timeIndex + 6; // Convert to 24-hour format
                const dayEvents = getEventsForDay(day).filter(event => {
                  const eventStart = new Date(event.start.dateTime || event.start.date);
                  return eventStart.getHours() === hour;
                });

                return (
                  <Box
                    key={`${dayIndex}-${timeIndex}`}
                    sx={{
                      height: 60,
                      borderBottom: '1px solid #f0f0f0',
                      p: 0.5,
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    {dayEvents.map((event, eventIndex) => (
                      <Card
                        key={`${event.id}-${eventIndex}`}
                        sx={{
                          mb: 0.5,
                          cursor: 'pointer',
                          backgroundColor: getEventColor(event),
                          color: 'white',
                          fontSize: '0.75rem',
                          maxHeight: 50,
                          overflow: 'hidden',
                          '&:hover': { 
                            opacity: 0.9,
                            transform: 'scale(1.02)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <CardContent sx={{ p: 0.5 }}>
                          <Typography variant="caption" fontWeight="bold" noWrap>
                            {event.summary || 'Untitled'}
                          </Typography>
                          {event.calendarSummary && (
                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.6rem' }}>
                              {event.calendarSummary}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                );
              })}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

// Monthly View Component
const MonthlyView = ({ events, onEventClick, getEventColor, formatEventTime }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  while (currentDate.getMonth() <= currentMonth && days.length < 42) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box sx={{ height: '70vh', overflow: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </Typography>
      
      <Grid container spacing={0}>
        {/* Weekday headers */}
        {weekdays.map(day => (
          <Grid item xs={12/7} key={day}>
            <Box sx={{ 
              p: 1, 
              textAlign: 'center', 
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
              fontWeight: 'bold'
            }}>
              <Typography variant="body2">{day}</Typography>
            </Box>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isToday = date.toDateString() === today.toDateString();
          
          return (
            <Grid item xs={12/7} key={index}>
              <Box sx={{ 
                minHeight: 100,
                border: '1px solid #e0e0e0',
                p: 1,
                backgroundColor: isToday ? '#e3f2fd' : 'white',
                opacity: isCurrentMonth ? 1 : 0.5
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isToday ? 'bold' : 'normal',
                    color: isToday ? 'primary.main' : 'inherit',
                    mb: 1
                  }}
                >
                  {date.getDate()}
                </Typography>
                
                <Box sx={{ maxHeight: 60, overflow: 'hidden' }}>
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <Box
                      key={`${event.id}-${eventIndex}`}
                      sx={{
                        backgroundColor: getEventColor(event),
                        color: 'white',
                        p: 0.5,
                        mb: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        '&:hover': { opacity: 0.8 }
                      }}
                      onClick={() => onEventClick(event)}
                    >
                      <Typography variant="caption" noWrap>
                        {event.summary || 'Untitled'}
                      </Typography>
                    </Box>
                  ))}
                  {dayEvents.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{dayEvents.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// Calendar Selection Component
const CalendarSelector = ({ calendars, selectedCalendars, onCalendarToggle, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Settings sx={{ mr: 1 }} />
          Select Calendars
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose which calendars to display in your view:
        </Typography>
        <List>
          {calendars.map((calendar) => (
            <ListItem key={calendar.id} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedCalendars.includes(calendar.id)}
                    onChange={() => onCalendarToggle(calendar.id)}
                    sx={{
                      color: calendar.backgroundColor || '#4285f4',
                      '&.Mui-checked': {
                        color: calendar.backgroundColor || '#4285f4',
                      },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: calendar.backgroundColor || '#4285f4',
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      {calendar.summary}
                      {calendar.primary && (
                        <Chip 
                          label="Primary" 
                          size="small" 
                          sx={{ ml: 1, fontSize: '0.6rem' }}
                        />
                      )}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendars, setSelectedCalendars] = useState(['primary']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (calendars.length > 0) {
      fetchEvents();
    }
  }, [timeRange, selectedCalendars, calendars]);



  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const calendarsData = await calendarService.getAvailableCalendars();
      setCalendars(calendarsData);
    } catch (err) {
      console.error('Error fetching calendars:', err);
      // If it's a 401 error, user needs to authenticate
      if (err.response?.status === 401) {
        setError('You need to sign in to access calendar features. Please sign in with Google.');
      } else {
        setError('Failed to load calendars. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let timeMin, timeMax;
      
      switch (timeRange) {
        case 'today':
          // Today only - from start of day to end of day
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          timeMin = today.toISOString();
          timeMax = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();
          break;
        case 'week':
          // Current week - from start of week to end of week
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          startOfWeek.setHours(0, 0, 0, 0);
          timeMin = startOfWeek.toISOString();
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week (next Sunday)
          endOfWeek.setHours(0, 0, 0, 0);
          timeMax = endOfWeek.toISOString();
          break;
        case 'month':
          // Current month - from start of month to end of month
          const currentMonth = new Date();
          const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          timeMin = startOfMonth.toISOString();
          
          const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          endOfMonth.setHours(23, 59, 59, 999);
          timeMax = endOfMonth.toISOString();
          break;
        default:
          // Default to current week
          const defaultNow = new Date();
          const defaultStartOfWeek = new Date(defaultNow);
          defaultStartOfWeek.setDate(defaultNow.getDate() - defaultNow.getDay());
          defaultStartOfWeek.setHours(0, 0, 0, 0);
          timeMin = defaultStartOfWeek.toISOString();
          
          const defaultEndOfWeek = new Date(defaultStartOfWeek);
          defaultEndOfWeek.setDate(defaultStartOfWeek.getDate() + 7);
          defaultEndOfWeek.setHours(0, 0, 0, 0);
          timeMax = defaultEndOfWeek.toISOString();
      }

      const response = await calendarService.getEvents({ 
        timeMin, 
        timeMax, 
        maxResults: 100, // Increased to get more events
        calendarIds: selectedCalendars.join(',')
      });
      setEvents(response);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEvents();
  };

  const handleCalendarToggle = (calendarId) => {
    setSelectedCalendars(prev => {
      if (prev.includes(calendarId)) {
        return prev.filter(id => id !== calendarId);
      } else {
        return [...prev, calendarId];
      }
    });
  };

  const formatEventTime = (event) => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    
    if (event.start.date) {
      // All-day event
      return start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } else {
      const startStr = start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' ' + start.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const endStr = end.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      return `${startStr} - ${endStr}`;
    }
  };

  const getEventColor = (event) => {
    // Use Google Calendar color if available, otherwise use default
    if (event.colorId) {
      const colors = {
        '1': '#7986cb', // Lavender
        '2': '#33b679', // Sage
        '3': '#8e63ce', // Grape
        '4': '#e67c73', // Flamingo
        '5': '#f6c026', // Banana
        '6': '#f5511d', // Tangerine
        '7': '#039be5', // Peacock
        '8': '#616161', // Graphite
        '9': '#3f51b5', // Blueberry
        '10': '#0b8043', // Basil
        '11': '#d60000', // Tomato
      };
      return colors[event.colorId] || '#4285f4';
    }
    return '#4285f4';
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const renderCalendarView = () => {
    switch (timeRange) {
      case 'today':
        return (
          <DailyView 
            events={events}
            onEventClick={handleEventClick}
            getEventColor={getEventColor}
            formatEventTime={formatEventTime}
          />
        );
      case 'week':
        return (
          <WeeklyView 
            events={events}
            onEventClick={handleEventClick}
            getEventColor={getEventColor}
            formatEventTime={formatEventTime}
          />
        );
      case 'month':
        return (
          <MonthlyView 
            events={events}
            onEventClick={handleEventClick}
            getEventColor={getEventColor}
            formatEventTime={formatEventTime}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  // Show Google Calendar connection prompt if no access token
  if (error && error.includes('Google Calendar access required')) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" textAlign="center">
          <CalendarToday sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h4" gutterBottom>
            Sign in with Google
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
            To view and manage your calendar events, you need to sign in with your Google account.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              // Sign in with Google
              window.location.href = '/api/auth/google';
            }}
            startIcon={<CalendarToday />}
            sx={{ mb: 2 }}
          >
            Connect Google Calendar
          </Button>
          <Typography variant="body2" color="text.secondary">
            You'll be redirected to Google to sign in and authorize calendar access.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
            Google Calendar
          </Typography>
          <Box display="flex" alignItems="center">
            <Tooltip title="Select Calendars">
              <IconButton 
                onClick={() => setShowCalendarSelector(true)} 
                color="primary" 
                sx={{ mr: 1 }}
              >
                <Settings />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleRefresh} color="primary" sx={{ mr: 2 }}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>
        
        {/* Selected Calendars Display */}
        {selectedCalendars.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Showing events from:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selectedCalendars.map(calendarId => {
                const calendar = calendars.find(cal => cal.id === calendarId);
                return (
                  <Chip
                    key={calendarId}
                    label={calendar?.summary || calendarId}
                    size="small"
                    sx={{
                      backgroundColor: calendar?.backgroundColor || '#4285f4',
                      color: 'white',
                      fontSize: '0.7rem'
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* View Selector */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={timeRange} 
          onChange={(e, newValue) => setTimeRange(newValue)}
          centered
          sx={{ 
            '& .MuiTab-root': { 
              minWidth: 120,
              textTransform: 'none',
              fontSize: '1rem'
            }
          }}
        >
          <Tab 
            value="today" 
            label="Today" 
            icon={<ViewDay />} 
            iconPosition="start"
          />
          <Tab 
            value="week" 
            label="This Week" 
            icon={<ViewWeek />} 
            iconPosition="start"
          />
          <Tab 
            value="month" 
            label="This Month" 
            icon={<ViewModule />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Calendar View */}
      {events.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedCalendars.length === 0 
              ? 'Please select at least one calendar to view events.'
              : timeRange === 'today' ? 'No events scheduled for today.' : 
                timeRange === 'week' ? 'No events scheduled for this week.' :
                'No events scheduled for this month.'}
          </Typography>
        </Paper>
      ) : (
        renderCalendarView()
      )}

      {/* Calendar Selection Dialog */}
      {showCalendarSelector && (
        <CalendarSelector
          calendars={calendars}
          selectedCalendars={selectedCalendars}
          onCalendarToggle={handleCalendarToggle}
          onClose={() => setShowCalendarSelector(false)}
        />
      )}

      {/* Event Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Event sx={{ mr: 1, color: getEventColor(selectedEvent) }} />
                {selectedEvent.summary || 'Untitled Event'}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {formatEventTime(selectedEvent)}
                  </Typography>
                </Box>
                
                {selectedEvent.location && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {selectedEvent.location}
                    </Typography>
                  </Box>
                )}

                {selectedEvent.calendarSummary && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {selectedEvent.calendarSummary}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {selectedEvent.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedEvent.description}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CalendarPage; 