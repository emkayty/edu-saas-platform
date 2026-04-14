/**
 * Student Dashboard Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuthStore, useStudentStore, useNotificationStore } from '../store';
import api from '../services/api';

const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { profile, timetable, setProfile, setTimetable } = useStudentStore();
  const { unreadCount } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, timetableRes] = await Promise.all([
        api.getStudentProfile(),
        api.getTimetable(),
      ]);
      setProfile(profileRes.data);
      setTimetable(timetableRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const menuItems = [
    {
      icon: '📚',
      label: 'My Courses',
      color: '#0066CC',
      onPress: () => navigation.navigate('Courses'),
    },
    {
      icon: '📝',
      label: 'Results',
      color: '#27ae60',
      onPress: () => navigation.navigate('Results'),
    },
    {
      icon: '💰',
      label: 'Fees',
      color: '#e67e22',
      onPress: () => navigation.navigate('Fees'),
    },
    {
      icon: '📅',
      label: 'Timetable',
      color: '#9b59b6',
      onPress: () => navigation.navigate('Timetable'),
    },
    {
      icon: '📖',
      label: 'Library',
      color: '#e74c3c',
      onPress: () => navigation.navigate('Library'),
    },
    {
      icon: '🏠',
      label: 'Hostel',
      color: '#1abc9c',
      onPress: () => navigation.navigate('Hostel'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.matricNumber}>{profile?.matricNumber || 'Loading...'}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.currentLevel || '--'}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.gpa || '--'}</Text>
          <Text style={styles.statLabel}>GPA</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.cgpa || '--'}</Text>
          <Text style={styles.statLabel}>CGPA</Text>
        </View>
      </View>

      {/* Today's Timetable */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Classes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Timetable')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {timetable?.length > 0 ? (
          timetable.slice(0, 3).map((session: any, index: number) => (
            <View key={index} style={styles.timetableCard}>
              <View style={styles.timetableTime}>
                <Text style={styles.timeText}>{session.time}</Text>
              </View>
              <View style={styles.timetableContent}>
                <Text style={styles.courseCode}>{session.courseCode}</Text>
                <Text style={styles.courseTitle}>{session.courseTitle}</Text>
                <Text style={styles.venue}>{session.venue}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No classes scheduled for today</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* AI Assistant */}
      <TouchableOpacity
        style={styles.aiAssistant}
        onPress={() => navigation.navigate('AIAssistant')}
      >
        <View style={styles.aiIcon}>
          <Text>🤖</Text>
        </View>
        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>AI Academic Advisor</Text>
          <Text style={styles.aiSubtitle}>
            Get personalized study recommendations
          </Text>
        </View>
        <Text style={styles.aiArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0066CC',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  matricNumber: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  profileButton: {
    marginLeft: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#0066CC',
    fontSize: 14,
  },
  timetableCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timetableTime: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  timeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  timetableContent: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  courseTitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  venue: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIconText: {
    fontSize: 22,
  },
  menuLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  aiAssistant: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  aiIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiContent: {
    flex: 1,
    marginLeft: 15,
  },
  aiTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  aiArrow: {
    color: '#fff',
    fontSize: 24,
  },
  bottomPadding: {
    height: 20,
  },
});

export default DashboardScreen;