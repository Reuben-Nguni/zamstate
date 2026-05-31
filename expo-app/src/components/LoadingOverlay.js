import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View, Text } from 'react-native';

export default function LoadingOverlay() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.text}>Loading ZAMSTATE...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  card: {
    width: '85%',
    padding: 24,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
  },
});
