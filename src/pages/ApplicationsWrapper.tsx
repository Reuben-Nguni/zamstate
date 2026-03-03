import React from 'react';
import Applications from './Applications';
import OwnerApplicationsPanel from './OwnerApplicationsPanel';
import { useAuthStore } from '../stores/authStore';

const ApplicationsWrapper: React.FC = () => {
  const { user } = useAuthStore();

  // owners and agents should see the owner panel directly when hitting /applications
  if (user?.role === 'owner' || user?.role === 'agent') {
    return <OwnerApplicationsPanel />;
  }

  // everyone else (tenants, admins) sees the generic applications page
  return <Applications />;
};

export default ApplicationsWrapper;
