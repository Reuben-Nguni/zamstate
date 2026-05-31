import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>You are not signed in.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.card}>
        <Text style={styles.heading}>Profile</Text>
        <View style={styles.fieldRow}><Text style={styles.label}>Name</Text><Text style={styles.value}>{user.firstName} {user.lastName}</Text></View>
        <View style={styles.fieldRow}><Text style={styles.label}>Email</Text><Text style={styles.value}>{user.email}</Text></View>
        <View style={styles.fieldRow}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{user.phone || 'Not set'}</Text></View>
        <View style={styles.fieldRow}><Text style={styles.label}>Role</Text><Text style={styles.value}>{user.role}</Text></View>
        <View style={styles.fieldRow}><Text style={styles.label}>Verified</Text><Text style={styles.value}>{user.isVerified ? 'Yes' : 'No'}</Text></View>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  card: {
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E6F43',
    marginBottom: 20,
  },
  fieldRow: {
    marginBottom: 18,
  },
  label: {
    color: '#777',
    marginBottom: 6,
    fontWeight: '700',
  },
  value: {
    color: '#222',
    fontSize: 16,
  },
  button: {
    marginTop: 28,
    backgroundColor: '#1E6F43',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
