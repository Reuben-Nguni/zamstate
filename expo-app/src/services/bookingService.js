import { request } from './api';

export const bookingService = {
  getBookings: () => request('/bookings'),
  getBooking: (id) => request(`/bookings/${id}`),
  createBooking: (data) => request('/bookings', { method: 'POST', body: data }),
  updateBooking: (id, data) => request(`/bookings/${id}`, { method: 'PUT', body: data }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
};
