/**
 * Ultra-Modern Mobile Dashboard
 * Clean, user-centric, empathetic design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);

  const student = {
    name: 'Ahmed Musa',
    level: '200 Level',
    department: 'Computer Science',
    gpa: '3.85',
    cgpa: '3.72',
    image: null,
  };

  const quickActions = [
    { icon: '📚', label: 'Courses', color: '#3B82F6', count: 6 },
    { icon: '📝', label: 'Results', color: '#10B981', count: 5 },
    { icon: '💳', label: 'Fees', color: '#F59E0B', badge: 'Due' },
    { icon: '📅', label: 'Time', color: '#8B5CF6', count: 4 },
    { icon: '📖', label: 'Library', color: '#EF4444', count: 2 },
    { icon: '🏠', label: 'Hostel', color: '#14B8A6', status: 'Applied' },
  ];

  const todayClasses = [
    { time: '08:00', course: 'CSC201', title: 'Data Structures', venue: 'Lab 3' },
    { time: '10:00', course: 'CSC203', title: 'Database Systems', venue: 'Room 12' },
    { time: '14:00', course: 'MTH202', title: 'Linear Algebra', venue: 'Room 8' },
  ];

  const announcements = [
    { id: 1, title: 'Mid-Semester Exam Schedule', date: 'Today', type: 'exam' },
    { id: 2, title: 'Fee Payment Deadline Extended', date: 'Yesterday', type: 'finance' },
    { id: 3, title: 'Library Holiday Hours', date: '2 days ago', type: 'general' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentInfo}>{student.level} • {student.department}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileInitials}>
              {student.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4F46E5']}
          />
        }
      >
        {/* GPA Card */}
        <View style={styles.gpaCard}>
          <View style={styles.gpaHeader}>
            <Text style={styles.gpaTitle}>Academic Performance</Text>
            <View style={styles.excellentBadge}>
              <Text style={styles.excellentText}>Excellent</Text>
            </View>
          </View>
          <View style={styles.gpaStats}>
            <View style={styles.gpaItem}>
              <Text style={styles.gpaValue}>{student.gpa}</Text>
              <Text style={styles.gpaLabel}>Current GPA</Text>
            </View>
            <View style={styles.gpaDivider} />
            <View style={styles.gpaItem}>
              <Text style={styles.gpaValueCum}>{student.cgpa}</Text>
              <Text style={styles.gpaLabel}>Cumulative</Text>
            </View>
          </View>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress to First Class</Text>
              <Text style={styles.progressPercent}>72%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.actionCard}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.actionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
                {action.count && (
                  <Text style={styles.actionCount}>{action.count}</Text>
                )}
                {action.badge && (
                  <View style={[styles.actionBadge, { backgroundColor: action.color }]}>
                    <Text style={styles.actionBadgeText}>{action.badge}</Text>
                  </View>
                )}
                {action.status && (
                  <Text style={styles.actionStatus}>{action.status}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.classesList}>
            {todayClasses.map((cls, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.classCard}
                activeOpacity={0.8}
              >
                <View style={styles.classTimeBox}>
                  <Text style={styles.classTime}>{cls.time}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.classCode}>{cls.course}</Text>
                  <Text style={styles.classTitle}>{cls.title}</Text>
                  <Text style={styles.classVenue}>📍 {cls.venue}</Text>
                </View>
                <View style={styles.classArrow}>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.announcementsList}>
            {announcements.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.announcementCard}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.announcementIcon,
                  item.type === 'exam' && styles.examIcon,
                  item.type === 'finance' && styles.financeIcon,
                  item.type === 'general' && styles.generalIcon,
                ]}>
                  <Text style={styles.announcementEmoji}>
                    {item.type === 'exam' ? '📝' : item.type === 'finance' ? '💳' : '📢'}
                  </Text>
                </View>
                <View style={styles.announcementContent}>
                  <Text style={styles.announcementTitle}>{item.title}</Text>
                  <Text style={styles.announcementDate}>{item.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Recommendation */}
        <TouchableOpacity style={styles.aiCard} activeOpacity={0.9}>
          <View style={styles.aiContent}>
            <View style={styles.aiIconBox}>
              <Text style={styles.aiIcon}>🤖</Text>
            </View>
            <View style={styles.aiTextBox}>
              <Text style={styles.aiTitle}>AI Academic Advisor</Text>
              <Text style={styles.aiSubtitle}>
                Review "Data Structures" topics before your test on Friday
              </Text>
            </View>
          </View>
          <Text style={styles.aiArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  studentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  studentInfo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  gpaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  gpaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gpaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  excellentBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  excellentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  gpaStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  gpaItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  gpaValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5',
  },
  gpaValueCum: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
  },
  gpaLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  gpaDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  progressSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '72%',
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  actionCount: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionStatus: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  classesList: {
    gap: 10,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  classTimeBox: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 14,
  },
  classTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  classInfo: {
    flex: 1,
  },
  classCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  classTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  classVenue: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  classArrow: {
    padding: 8,
  },
  arrowIcon: {
    fontSize: 20,
    color: '#CBD5E1',
  },
  announcementsList: {
    gap: 10,
  },
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  announcementIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  examIcon: { backgroundColor: '#FEE2E2' },
  financeIcon: { backgroundColor: '#FEF3C7' },
  generalIcon: { backgroundColor: '#DBEAFE' },
  announcementEmoji: {
    fontSize: 20,
  },
  announcementContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  announcementDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  aiIcon: {
    fontSize: 24,
  },
  aiTextBox: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  aiArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 100,
  },
});

export default DashboardScreen;