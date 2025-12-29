import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import api from '../config/api';

const DashboardScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API calls
  const [stats] = useState({
    totalVolunteers: 1247,
    tasksCompleted: 342,
    ongoingActivities: 28,
    totalActivities: 156,
  });

  const [volunteers] = useState([
    { id: 1, name: 'Sarah Johnson', status: 'active', avatar: 'SJ', role: 'Community Organizer' },
    { id: 2, name: 'Michael Chen', status: 'available', avatar: 'MC', role: 'Event Coordinator' },
    { id: 3, name: 'Emily Davis', status: 'assigned', avatar: 'ED', role: 'Volunteer Lead' },
    { id: 4, name: 'David Wilson', status: 'active', avatar: 'DW', role: 'Field Worker' },
    { id: 5, name: 'Lisa Anderson', status: 'available', avatar: 'LA', role: 'Support Staff' },
    { id: 6, name: 'James Brown', status: 'assigned', avatar: 'JB', role: 'Project Manager' },
  ]);

  const [activities] = useState([
    { id: 1, title: 'Community Cleanup', progress: 75, date: '2024-01-15', status: 'ongoing' },
    { id: 2, title: 'Food Drive Campaign', progress: 100, date: '2024-01-10', status: 'completed' },
    { id: 3, title: 'Education Workshop', progress: 45, date: '2024-01-20', status: 'ongoing' },
    { id: 4, title: 'Health Check-up Drive', progress: 30, date: '2024-01-25', status: 'ongoing' },
  ]);

  const [tasks] = useState([
    { id: 1, title: 'Coordinate volunteer schedules', completed: true },
    { id: 2, title: 'Prepare event materials', completed: true },
    { id: 3, title: 'Contact local partners', completed: false },
    { id: 4, title: 'Finalize venue booking', completed: false },
    { id: 5, title: 'Send reminder notifications', completed: false },
  ]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      // Optionally fetch fresh user data from API
      // const response = await api.get('/users/me');
      // if (response.data.success) {
      //   setUser(response.data.data);
      // }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = () => {
    // Handle notification press
    console.log('Notification pressed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'available':
        return '#3b82f6';
      case 'assigned':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'completed':
        return { bg: '#d1fae5', text: '#065f46' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onNotificationPress={handleNotificationPress} />
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.name || 'User'}! 👋
          </Text>
          <Text style={styles.headerSubtext}>Here's your dashboard overview</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>👥</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.totalVolunteers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Volunteers</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>✓</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>📋</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.ongoingActivities}</Text>
              <Text style={styles.statLabel}>Ongoing Activities</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>📊</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.totalActivities}</Text>
              <Text style={styles.statLabel}>Total Activities</Text>
            </View>
          </View>
        </View>

        {/* Volunteers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Volunteers</Text>
            <View style={styles.sectionCount}>
              <Text style={styles.sectionCountText}>{volunteers.length}</Text>
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.volunteersScroll}
            contentContainerStyle={styles.volunteersContainer}
          >
            {volunteers.map((volunteer) => (
              <View key={volunteer.id} style={styles.volunteerCard}>
                <View style={styles.volunteerAvatarContainer}>
                  <View style={styles.volunteerAvatar}>
                    <Text style={styles.volunteerAvatarText}>{volunteer.avatar}</Text>
                  </View>
                  <View 
                    style={[
                      styles.statusDot, 
                      { backgroundColor: getStatusColor(volunteer.status) }
                    ]} 
                  />
                </View>
                <View style={styles.volunteerInfo}>
                  <Text style={styles.volunteerName}>{volunteer.name}</Text>
                  <Text style={styles.volunteerRole}>{volunteer.role}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Activities & Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activities & Tasks</Text>
            <Text style={styles.sectionIcon}>📅</Text>
          </View>

          {/* Activities List */}
          <View style={styles.activitiesList}>
            {activities.map((activity) => {
              const statusColors = getActivityStatusColor(activity.status);
              return (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <View style={[styles.activityStatus, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.activityStatusText, { color: statusColors.text }]}>
                        {activity.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityProgress}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[styles.progressFill, { width: `${activity.progress}%` }]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{activity.progress}%</Text>
                  </View>
                  <View style={styles.activityDate}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.dateText}>
                      {new Date(activity.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Tasks Checklist */}
          <View style={styles.tasksSection}>
            <Text style={styles.tasksTitle}>Today's Tasks</Text>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={[styles.taskCheckbox, task.completed && styles.taskCheckboxChecked]}>
                  {task.completed && <Text style={styles.checkIcon}>✓</Text>}
                </View>
                <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
                  {task.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Location & Reach Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location & Reach</Text>
            <Text style={styles.sectionIcon}>📍</Text>
          </View>
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPinLarge}>📍</Text>
              <Text style={styles.mapText}>Community Map</Text>
            </View>
            <View style={styles.communityClusters}>
              <Text style={styles.clusterTitle}>Community Clusters</Text>
              <View style={styles.clusterList}>
                <View style={styles.clusterItem}>
                  <View style={styles.clusterDot} />
                  <Text style={styles.clusterName}>Downtown District</Text>
                  <Text style={styles.clusterCount}>342</Text>
                </View>
                <View style={styles.clusterItem}>
                  <View style={styles.clusterDot} />
                  <Text style={styles.clusterName}>Northside Community</Text>
                  <Text style={styles.clusterCount}>218</Text>
                </View>
                <View style={styles.clusterItem}>
                  <View style={styles.clusterDot} />
                  <Text style={styles.clusterName}>East End Hub</Text>
                  <Text style={styles.clusterCount}>156</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Connection Flow Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connection Flow</Text>
            <Text style={styles.sectionIcon}>🔗</Text>
          </View>
          <View style={styles.networkContainer}>
            <View style={styles.networkNodes}>
              <View style={styles.networkNode}>
                <Text style={styles.nodeIcon}>👥</Text>
                <Text style={styles.nodeLabel}>People</Text>
              </View>
              <View style={styles.networkNode}>
                <Text style={styles.nodeIcon}>📋</Text>
                <Text style={styles.nodeLabel}>Tasks</Text>
              </View>
            </View>
            <View style={styles.connectionStats}>
              <View style={styles.connectionStat}>
                <Text style={styles.connectionNumber}>1,247</Text>
                <Text style={styles.connectionLabel}>Active Connections</Text>
              </View>
              <View style={styles.connectionStat}>
                <Text style={styles.connectionNumber}>342</Text>
                <Text style={styles.connectionLabel}>Task Assignments</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 24,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  sectionCount: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionIcon: {
    fontSize: 20,
  },
  volunteersScroll: {
    marginHorizontal: -16,
  },
  volunteersContainer: {
    paddingHorizontal: 16,
  },
  volunteersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  volunteerCard: {
    width: 140,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginRight: 12,
  },
  volunteerAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  volunteerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volunteerAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  volunteerInfo: {
    alignItems: 'center',
  },
  volunteerName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  volunteerRole: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  activitiesList: {
    marginBottom: 16,
  },
  activityCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activityProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 40,
  },
  activityDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateIcon: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tasksSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  mapContainer: {
    gap: 16,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPinLarge: {
    fontSize: 40,
    marginBottom: 8,
  },
  mapText: {
    fontSize: 14,
    color: '#6b7280',
  },
  communityClusters: {
    gap: 12,
  },
  clusterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  clusterList: {
    gap: 10,
  },
  clusterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  clusterDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  clusterName: {
    flex: 1,
    fontSize: 13,
    color: '#1f2937',
  },
  clusterCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  networkContainer: {
    gap: 16,
  },
  networkNodes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  networkNode: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 100,
  },
  nodeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  nodeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  connectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
  },
  connectionStat: {
    alignItems: 'center',
    gap: 6,
  },
  connectionNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  connectionLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default DashboardScreen;
