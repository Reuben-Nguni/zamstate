import { useAuthStore } from '../stores/authStore';

// Use environment variable for API base URL (required for production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL environment variable is not set');
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

const apiClient = async (endpoint: string, options: ApiRequestOptions = {}) => {
  const { method = 'GET', body, params, headers = {} } = options;
  const token = useAuthStore.getState().token;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    if (queryString) url += `?${queryString}`;
  }

  const defaultHeaders: Record<string, string> = {
    ...headers,
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const fetchOptions: any = {
      method,
      headers: defaultHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    };

    // Let browser set Content-Type (including boundary) for FormData
    if (isFormData) {
      delete fetchOptions.headers['Content-Type'];
    } else {
      // ensure JSON content-type when sending JSON
      fetchOptions.headers = { 'Content-Type': 'application/json', ...fetchOptions.headers };
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const authService = {
  register: (data: any) =>
    apiClient('/auth/register', { method: 'POST', body: data }),
  login: (email: string, password: string) =>
    apiClient('/auth/login', { method: 'POST', body: { email, password } }),
  getProfile: () =>
    apiClient('/auth/profile'),
  updateProfile: (data: any) =>
    apiClient('/auth/profile', { method: 'PUT', body: data }),
  requestPasswordReset: (data: { email: string }) =>
    apiClient('/auth/request-password-reset', { method: 'POST', body: data }),
  resetPassword: (data: { token: string; password: string }) =>
    apiClient('/auth/reset-password', { method: 'POST', body: data }),
  resendVerification: (data: { email: string }) =>
    apiClient('/auth/resend-verification', { method: 'POST', body: data }),
};

export const messageService = {
  sendMessage: (data: any) =>
    apiClient('/messages/send', { method: 'POST', body: data }),
  getConversations: () =>
    apiClient('/messages/conversations'),
  getMessages: (conversationId: string) =>
    apiClient(`/messages/conversations/${conversationId}/messages`),
};

export const userService = {
  getPresence: () => apiClient('/users/presence'),
};

export const analyticsService = {
  getOverview: () => apiClient('/analytics/overview'),
};

export const propertyService = {
  getProperties: (filters?: any) =>
    apiClient('/properties', { params: filters }),
  getPropertyById: (id: string) =>
    apiClient(`/properties/${id}`),
  createProperty: (formData: FormData) =>
    apiClient('/properties', {
      method: 'POST',
      headers: {},
      body: formData,
    }),
  updateProperty: (id: string, formData: FormData | any) =>
    apiClient(`/properties/${id}`, { 
      method: 'PUT', 
      headers: formData instanceof FormData ? {} : {},
      body: formData 
    }),
  deleteProperty: (id: string) =>
    apiClient(`/properties/${id}`, { method: 'DELETE' }),
  getPropertyBookings: (id: string) =>
    apiClient(`/properties/${id}/bookings`),
};

export default apiClient;
