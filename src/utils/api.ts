import { useAuthStore } from '../stores/authStore';

// Use environment variable for API base URL (required for production)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL not defined, falling back to ' + API_BASE_URL);
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

const apiClient = async (endpoint: string, options: ApiRequestOptions = {}) => {
  const { method = 'GET', body, params, headers = {} } = options;
  // Get token from store first, then fall back to localStorage (in case store hasn't hydrated yet)
  let token = useAuthStore.getState().token;
  if (!token) {
    token = localStorage.getItem('auth_token');
  }

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
      // Safely parse error body (may be empty or not JSON)
      let errorBody: any = null;
      try {
        const text = await response.text();
        errorBody = text ? JSON.parse(text) : null;
      } catch (e) {
        errorBody = null;
      }

      // If unauthorized, clear stored auth and surface a clear message
      if (response.status === 401) {
        try {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth-storage');
        } catch (e) {
          // ignore
        }
        throw new Error((errorBody && errorBody.message) || 'Invalid or expired token');
      }

      throw new Error((errorBody && errorBody.message) || `API Error: ${response.status}`);
    }

    // Parse JSON response safely
    try {
      return await response.json();
    } catch (e) {
      return null;
    }
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
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
  updateEmail: (newEmail: string, password: string) =>
    apiClient('/auth/update-email', { method: 'POST', body: { newEmail, password } }),
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
  uploadAvatar: (formData: FormData) => apiClient('/cloudinary/upload', { method: 'POST', headers: {}, body: formData }),
  getTenants: () => apiClient('/users/tenants'),
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
  getOwnerProperties: () =>
    apiClient('/properties?owner=true'),
};

export const adminService = {
  getAllUsers: () =>
    apiClient('/admin/users'),
  getPendingUsers: () =>
    apiClient('/admin/users/pending'),
  approveUser: (userId: string) =>
    apiClient(`/admin/users/${userId}/approve`, { method: 'PUT' }),
  rejectUser: (userId: string) =>
    apiClient(`/admin/users/${userId}/reject`, { method: 'PUT' }),
  deleteUser: (userId: string) =>
    apiClient(`/admin/users/${userId}`, { method: 'DELETE' }),
  getUserApprovalStatus: () =>
    apiClient('/admin/approval-status'),
};

export const expenseService = {
  createExpense: (data: any) =>
    apiClient('/expenses', { method: 'POST', body: data }),
  getOwnerExpenses: (filters?: any) =>
    apiClient('/expenses', { params: filters }),
  getPropertyExpenses: (propertyId: string, filters?: any) =>
    apiClient(`/expenses/property/${propertyId}`, { params: filters }),
  updateExpense: (expenseId: string, data: any) =>
    apiClient(`/expenses/${expenseId}`, { method: 'PUT', body: data }),
  markExpenseAsPaid: (expenseId: string, data?: any) =>
    apiClient(`/expenses/${expenseId}/pay`, { method: 'PUT', body: data }),
  deleteExpense: (expenseId: string) =>
    apiClient(`/expenses/${expenseId}`, { method: 'DELETE' }),
  getExpenseSummary: () =>
    apiClient('/expenses/summary'),
};

export const rentalService = {
  createRental: (data: any) =>
    apiClient('/rentals', { method: 'POST', body: data }),
  getOwnerRentals: (filters?: any) =>
    apiClient('/rentals', { params: filters }),
  getPropertyRentals: (propertyId: string, filters?: any) =>
    apiClient(`/rentals/property/${propertyId}`, { params: filters }),
  updateRental: (rentalId: string, data: any) =>
    apiClient(`/rentals/${rentalId}`, { method: 'PUT', body: data }),
  endRental: (rentalId: string, data?: any) =>
    apiClient(`/rentals/${rentalId}/end`, { method: 'PUT', body: data }),
  deleteRental: (rentalId: string) =>
    apiClient(`/rentals/${rentalId}`, { method: 'DELETE' }),
  getRentalSummary: () =>
    apiClient('/rentals/summary'),
};

export const paymentService = {
  createPayment: (data: any) => {
    // support FormData for file upload
    if (data instanceof FormData) {
      return apiClient('/payments', { method: 'POST', headers: {}, body: data });
    }
    return apiClient('/payments', { method: 'POST', body: data });
  },
  getPayments: (filters?: any) => apiClient('/payments', { params: filters }),
  verifyPayment: (id: string, status: string, note?: string) => apiClient(`/payments/${id}/verify`, { method: 'PUT', body: { status, note } }),
  getPaymentAudit: (id: string) => apiClient(`/payments/${id}/audit`),
};

export const applicationService = {
  // message optional, attachments can be File or File[]
  applyToProperty: (
    propertyId: string,
    data: { message?: string; attachments?: File[] | FileList } | FormData
  ) => {
    // allow passing FormData directly or build it here
    let body: any;
    if (data instanceof FormData) {
      body = data;
    } else {
      const form = new FormData();
      if (data.message) form.append('message', data.message);
      if (data.attachments) {
        const files = Array.from(data.attachments as FileList);
        files.forEach((file) => form.append('attachments', file));
      }
      body = form;
    }
    return apiClient(`/applications/${propertyId}/apply`, { method: 'POST', headers: {}, body });
  },
  getApplicationsForProperty: (propertyId: string) => apiClient(`/applications/${propertyId}`),
  selectApplicant: (id: string) => apiClient(`/applications/select/${id}`, { method: 'PUT' }),
};

export default apiClient;
