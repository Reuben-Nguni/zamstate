import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const REMOTE_API_BASE = 'https://zamstate.onrender.com/api';
const LOCALHOST_API_BASE = `http://${LOCAL_API_HOST}:5000/api`;
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (Platform.OS === 'web' ? REMOTE_API_BASE : LOCALHOST_API_BASE);

const getSavedToken = async () => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    return null;
  }
};

export const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, params, headers = {}, skipAuth = false } = options;
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {})
    ).toString();
    if (query) url += `?${query}`;
  }

  const token = skipAuth ? null : await getSavedToken();
  const requestHeaders = {
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const fetchOptions = {
    method,
    headers: requestHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  };

  if (!isFormData) {
    fetchOptions.headers = { 'Content-Type': 'application/json', ...requestHeaders };
  }

  const response = await fetch(url, fetchOptions);
  const text = await response.text();

  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return data;
};
