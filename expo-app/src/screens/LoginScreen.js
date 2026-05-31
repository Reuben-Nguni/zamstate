import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      return Alert.alert('Login required', 'Please enter both email and password.');
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Login failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Sign in to ZAMSTATE</Text>
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Login'}</Text>
        </TouchableOpacity>
        <View style={styles.footerRow}>
          <Text style={styles.smallText}>No account yet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    color: '#1E6F43',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FBFBFB',
  },
  button: {
    backgroundColor: '#1E6F43',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallText: {
    color: '#888',
  },
  linkText: {
    color: '#1E6F43',
    fontWeight: '700',
  },
});
