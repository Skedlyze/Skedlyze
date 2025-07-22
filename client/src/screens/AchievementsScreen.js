import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { usersAPI } from '../services/api';

const AchievementsScreen = () => {
  const [achievements, setAchievements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await usersAPI.getAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const getAchievementIcon = (type) => {
    const icons = {
      task_completion: '✅',
      streak: '🔥',
      level_up: '⭐',
      special: '🏆',
    };
    return icons[type] || '🏆';
  };

  const getAchievementColor = (type) => {
    const colors = {
      task_completion: '#10b981',
      streak: '#f59e0b',
      level_up: '#6366f1',
      special: '#ec4899',
    };
    return colors[type] || '#6366f1';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>
          {achievements.length} achievements earned
        </Text>
      </View>

      {/* Achievements List */}
      {achievements.length > 0 ? (
        achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>
                {getAchievementIcon(achievement.type)}
              </Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              <View style={styles.achievementMeta}>
                <Text style={styles.achievementDate}>
                  Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                </Text>
                <Text
                  style={[
                    styles.achievementReward,
                    { color: getAchievementColor(achievement.type) },
                  ]}
                >
                  +{achievement.experience_reward} XP
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.achievementBadge,
                { backgroundColor: getAchievementColor(achievement.type) },
              ]}
            >
              <Text style={styles.achievementBadgeText}>EARNED</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyText}>No achievements yet</Text>
          <Text style={styles.emptySubtext}>
            Complete tasks, maintain streaks, and level up to earn achievements!
          </Text>
          
          {/* Achievement Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Available Achievements</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewIcon}>✅</Text>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>First Steps</Text>
                <Text style={styles.previewDescription}>
                  Complete your first task
                </Text>
                <Text style={styles.previewReward}>+25 XP</Text>
              </View>
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewIcon}>🔥</Text>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>Getting Started</Text>
                <Text style={styles.previewDescription}>
                  Maintain a 3-day streak
                </Text>
                <Text style={styles.previewReward}>+30 XP</Text>
              </View>
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewIcon}>⭐</Text>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>Level 5</Text>
                <Text style={styles.previewDescription}>
                  Reach level 5
                </Text>
                <Text style={styles.previewReward}>+50 XP</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  achievementCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  achievementReward: {
    fontSize: 12,
    fontWeight: '600',
  },
  achievementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  previewSection: {
    width: '100%',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    opacity: 0.6,
  },
  previewIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  previewReward: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
});

export default AchievementsScreen; 