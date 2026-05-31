import { request } from './api';

export const applicationService = {
  getTenantApplications: () => request('/applications/tenant/all-applications'),
  getTenantApprovedProperties: () => request('/applications/tenant/approved-properties'),
  getOwnerApplications: () => request('/applications/owner/all-applications'),
  getPropertyApplications: (propertyId) => request(`/applications/${propertyId}`),
  applyToProperty: (propertyId, formData) => request(`/applications/${propertyId}/apply`, { method: 'POST', body: formData }),
};
