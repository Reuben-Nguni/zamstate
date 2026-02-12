import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../utils/api';
import '../styles/admin.scss';

interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const response = await apiClient('/admin/users/pending');
      setPendingUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch pending users:', error);
      setPendingUsers([]);
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await apiClient('/admin/users');
      setAllUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch all users:', error);
      setAllUsers([]);
    }
  };

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await Promise.all([fetchPendingUsers(), fetchAllUsers()]);
      setLoading(false);
    };
    initLoad();
  }, []);

  const handleApproveUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await apiClient(`/admin/users/${userId}/approve`, { method: 'PUT' });
      // Refresh both lists
      await fetchPendingUsers();
      await fetchAllUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await apiClient(`/admin/users/${userId}/reject`, { method: 'PUT' });
      // Refresh both lists
      await fetchPendingUsers();
      await fetchAllUsers();
    } catch (error) {
      console.error('Failed to reject user:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Only show this page to admins
  if (user?.role !== 'admin') {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-card">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container user-management">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Approve or manage user access to post properties</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approval ({pendingUsers.length})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Users ({allUsers.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : activeTab === 'pending' ? (
        <div className="users-section">
          {pendingUsers.length === 0 ? (
            <div className="empty-state">
              <p>No pending users awaiting approval</p>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-role">Role</div>
                <div className="col-date">Joined</div>
                <div className="col-actions">Actions</div>
              </div>
              {pendingUsers.map((u) => (
                <div key={u._id} className="table-row">
                  <div className="col-name">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="col-email">{u.email}</div>
                  <div className="col-role">
                    <span className="role-badge">{u.role}</span>
                  </div>
                  <div className="col-date">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApproveUser(u._id)}
                      disabled={actionLoading === u._id}
                    >
                      {actionLoading === u._id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      className="btn btn-reject"
                      onClick={() => handleRejectUser(u._id)}
                      disabled={actionLoading === u._id}
                    >
                      {actionLoading === u._id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="users-section">
          {allUsers.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            <div className="users-table">
              <div className="table-header">
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-role">Role</div>
                <div className="col-status">Status</div>
                <div className="col-date">Joined</div>
                <div className="col-actions">Actions</div>
              </div>
              {allUsers.map((u) => (
                <div key={u._id} className="table-row">
                  <div className="col-name">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="col-email">{u.email}</div>
                  <div className="col-role">
                    <span className="role-badge">{u.role}</span>
                  </div>
                  <div className="col-status">
                    <span
                      className={`status-badge ${
                        u.isApproved ? 'approved' : 'pending'
                      }`}
                    >
                      {u.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="col-date">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-actions">
                    {u.role !== 'admin' && (
                      <>
                        {u.isApproved ? (
                          <button
                            className="btn btn-reject"
                            onClick={() => handleRejectUser(u._id)}
                            disabled={actionLoading === u._id}
                          >
                            {actionLoading === u._id
                              ? 'Processing...'
                              : 'Revoke'}
                          </button>
                        ) : (
                          <button
                            className="btn btn-approve"
                            onClick={() => handleApproveUser(u._id)}
                            disabled={actionLoading === u._id}
                          >
                            {actionLoading === u._id
                              ? 'Processing...'
                              : 'Approve'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
