import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';

export default function PropertyListScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadProperties = async () => {
    try {
      setError(null);
      const response = await propertyService.getProperties({ limit: 20 });
      const payload = Array.isArray(response) ? response : response?.data || response?.properties || [];
      setProperties(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Available properties</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={() => { setRefreshing(true); loadProperties(); }}>
          <Text style={styles.reloadLabel}>Refresh</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id || item._id || String(item.title)}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: item._id || item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProperties(); }} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No properties found.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E6F43',
  },
  reloadButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  reloadLabel: {
    color: '#1E6F43',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
    fontSize: 16,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 8,
    textAlign: 'center',
  },
});
