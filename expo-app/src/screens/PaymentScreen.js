import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

export default function PaymentScreen({ navigation }) {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPayments = async () => {
    try {
      setError(null);
      const result = await paymentService.getPayments();
      const payload = Array.isArray(result) ? result : result?.data || result?.payments || [];
      setPayments(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.heading}>Sign in to view payments.</Text>
        <TouchableOpacity style={styles.authButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.authButtonText}>Go to login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Payments</Text>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <FlatList
        data={payments}
        keyExtractor={(item) => item._id || item.id || String(item.createdAt)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPayments(); }} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No payments yet.</Text> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.property?.title || 'Payment'}</Text>
            <Text style={styles.cardText}>Amount: {item.currency || 'ZMW'} {item.amount || 'N/A'}</Text>
            <Text style={styles.cardText}>Method: {item.method || 'Unknown'}</Text>
            <Text style={styles.cardText}>Status: {item.status || 'pending'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 16,
  },
  headerRow: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E6F43',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    color: '#555',
    marginBottom: 4,
  },
  empty: {
    marginTop: 28,
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F9FC',
  },
  authButton: {
    marginTop: 18,
    backgroundColor: '#1E6F43',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  errorText: {
    color: '#B00020',
    marginBottom: 12,
    textAlign: 'center',
  },
});
