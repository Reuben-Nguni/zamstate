import { request } from './api';

export const paymentService = {
  getPayments: (params) => request('/payments', { params }),
  submitPayment: (formData) => request('/payments', { method: 'POST', body: formData }),
};
