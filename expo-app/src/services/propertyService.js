import { request } from './api';

export const propertyService = {
  getProperties: (params) => request('/properties', { params, skipAuth: true }),
  getPropertyById: (id) => request(`/properties/${id}`, { skipAuth: true }),
};
