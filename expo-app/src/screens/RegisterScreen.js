import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !password || !firstName || !lastName || !phone) {
      return Alert.alert('All fields required', 'Enter your name, email, phone and password.');
    }

    setIsSubmitting(true);
    try {
      await register({ firstName, lastName, email: email.trim(), phone: phone.trim(), password, role: 'tenant' });
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Registration failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.card} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create your ZAMSTATE account</Text>
        <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Creating account...' : 'Register'}</Text>
        </TouchableOpacity>
        <View style={styles.footerRow}>
          <Text style={styles.smallText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
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
  card: {
    padding: 24,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
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
    color: '#fff',
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 18,
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
