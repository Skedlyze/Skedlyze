import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { calendarAPI } from '../services/api';

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const [eventsResponse, statusResponse] = await Promise.all([
        calendarAPI.getEvents(),
        calendarAPI.getSyncStatus(),
      ]);
      setEvents(eventsResponse.data);
      setSyncStatus(statusResponse.data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendarData();
    setRefreshing(false);
  };

  const handleSyncTasks = async () => {
    try {
      await calendarAPI.syncAllTasks();
      Alert.alert('Success', 'Tasks synced to calendar successfully!');
      await loadCalendarData();
    } catch (error) {
      Alert.alert('Error', 'Failed to sync tasks to calendar');
    }
  };

  const formatEventTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Sync Status */}
      <View style={styles.syncSection}>
        <Text style={styles.sectionTitle}>Calendar Sync</Text>
        <View style={styles.syncCard}>
          <View style={styles.syncInfo}>
            <Text style={styles.syncStatus}>
              {syncStatus?.enabled ? '✅ Enabled' : '❌ Disabled'}
            </Text>
            <Text style={styles.syncDescription}>
              {syncStatus?.enabled
                ? 'Tasks are automatically synced to Google Calendar'
                : 'Enable calendar sync to automatically add tasks to your calendar'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSyncTasks}
            disabled={!syncStatus?.enabled}
          >
            <Text style={styles.syncButtonText}>Sync Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Events */}
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {events.length > 0 ? (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.summary}</Text>
                <Text style={styles.eventTime}>
                  {formatEventTime(event.start.dateTime || event.start.date)}
                </Text>
              </View>
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
              {event.location && (
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyEvents}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No upcoming events</Text>
            <Text style={styles.emptySubtext}>
              Your Google Calendar events will appear here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  syncSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  syncCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  syncInfo: {
    marginBottom: 16,
  },
  syncStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  syncDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  syncButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  eventTime: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyEvents: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default CalendarScreen; 