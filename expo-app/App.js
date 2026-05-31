import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import MapScreen from './MapScreen';

export default function App() {
  const [showMap, setShowMap] = useState(false);

  if (showMap) return <MapScreen />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the ZAMSTATE Expo App</Text>
      <Text style={styles.subtitle}>This app includes a property map and basic listings.</Text>
      <View style={{ marginTop: 16 }}>
        <Button title="Open Property Map" onPress={() => setShowMap(true)} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});
