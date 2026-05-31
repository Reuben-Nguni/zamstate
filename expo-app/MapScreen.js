import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function MapScreen() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/properties?limit=100`);
        const data = await res.json();
        if (!mounted) return;
        setProperties(data.data || data || []);
      } catch (err) {
        console.warn('Failed to fetch properties:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" />
    </View>
  );

  if (selected) {
    const lat = selected.location?.coordinates?.lat || -15.3875;
    const lng = selected.location?.coordinates?.lng || 28.3228;
    const embed = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Button title="Back" onPress={() => setSelected(null)} />
          <Text style={styles.headerTitle}>{selected.title}</Text>
        </View>
        <WebView source={{ uri: embed }} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={styles.title}>Property Map</Text>
      <Text style={styles.subtitle}>Tap a property to open it on the embedded map.</Text>
      <FlatList
        data={properties}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => setSelected(item)}>
            <View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub}>ZK {item.price?.toLocaleString?.() || item.price}</Text>
            </View>
            <Button title="View" onPress={() => setSelected(item)} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#666', marginBottom: 12 },
  item: { padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSub: { color: '#666' },
  header: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 16, fontWeight: '600', marginLeft: 12 }
});
