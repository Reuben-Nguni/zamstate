import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PropertyListScreen from '../screens/PropertyListScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1E6F43',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Properties') iconName = 'home-outline';
          if (route.name === 'Dashboard') iconName = 'grid-outline';
          if (route.name === 'Bookings') iconName = 'calendar-outline';
          if (route.name === 'Payments') iconName = 'card-outline';
          if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Properties" component={PropertyListScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Bookings" component={BookingScreen} />
      <Tab.Screen name="Payments" component={PaymentScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
