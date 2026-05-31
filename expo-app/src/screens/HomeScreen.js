import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Ionicons name="business-outline" size={42} color="#1E6F43" style={styles.brandIcon} />
          <Text style={styles.title}>Welcome to ZAMSTATE</Text>
        </View>
        <Text style={styles.subtitle}>Manage rentals, tenants, bookings and payments all in one mobile-friendly property platform.</Text>

        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Properties')}>
            <Text style={styles.actionLabel}>Browse Properties</Text>
          </TouchableOpacity>
          {user ? (
            <TouchableOpacity style={styles.actionButtonAlt} onPress={() => navigation.navigate('Main')}>
              <Text style={styles.actionLabelAlt}>Go to Dashboard</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButtonAlt} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.actionLabelAlt}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonAlt} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.actionLabelAlt}>Create Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Why use ZAMSTATE?</Text>
          <Text style={styles.infoText}>• Secure tenant and owner workflows</Text>
          <Text style={styles.infoText}>• Real-time property browsing and booking</Text>
          <Text style={styles.infoText}>• Mobile money-ready payment and verification support</Text>
          <Text style={styles.infoText}>• Role-specific dashboards for tenants, owners, and admins</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E6F43',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4F5B62',
    marginBottom: 24,
    lineHeight: 24,
  },
  actionGroup: {
    marginBottom: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#1E6F43',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonAlt: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionLabelAlt: {
    color: '#1E6F43',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#455A64',
    marginBottom: 10,
    lineHeight: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandIcon: {
    marginRight: 10,
  },
});
