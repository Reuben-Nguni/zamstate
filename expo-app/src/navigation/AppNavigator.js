import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PropertyListScreen from '../screens/PropertyListScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1E6F43' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ZAMSTATE' }} />
      <Stack.Screen name="Properties" component={PropertyListScreen} options={{ title: 'Browse Properties' }} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ title: 'Property Details' }} />
      <Stack.Screen name="Applications" component={ApplicationsScreen} options={{ title: 'Applications' }} />
      {!user && <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />}
      {!user && <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />}
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
