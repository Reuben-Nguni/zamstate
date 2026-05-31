import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Dashboard</Text>
          <Text style={styles.message}>Please sign in to access your dashboard, payments, property listings, and tenant applications.</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Sign in now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.greetingCard}>
        <Text style={styles.heading}>Hello, {user.firstName || 'Guest'}</Text>
        <Text style={styles.message}>Welcome back to your ZAMSTATE mobile dashboard.</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={styles.statValue}>Role</Text><Text style={styles.statLabel}>{user.role}</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>Verified</Text><Text style={styles.statLabel}>{user.isVerified ? 'Yes' : 'No'}</Text></View>
      </View>
      <View style={styles.actionList}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.actionText}>Update profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Properties')}>
          <Text style={styles.actionText}>Browse listings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Bookings')}>
          <Text style={styles.actionText}>My bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Payments')}>
          <Text style={styles.actionText}>My payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Applications')}>
          <Text style={styles.actionText}>Applications</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 16,
  },
  greetingCard: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E6F43',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statCard: {
    width: '48%',
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statValue: {
    fontSize: 16,
    color: '#1E6F43',
    fontWeight: '700',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  actionList: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  actionText: {
    fontSize: 16,
    color: '#1E6F43',
    fontWeight: '700',
  },
});
