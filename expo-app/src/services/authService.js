import { request } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('auth_token', token);
  } catch (error) {
    console.warn('Failed to save token', error);
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch (error) {
    console.warn('Failed to clear token', error);
  }
};

export const authService = {
  register: (data) => request('/auth/register', { method: 'POST', body: data, skipAuth: true }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true }),
  getProfile: () => request('/auth/profile'),
};
