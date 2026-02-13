import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminService } from '../utils/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

const UserDeletion: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      // Filter out admin users
      const nonAdminUsers = response?.data?.filter((u: User) => u.role !== 'admin') || [];
      setUsers(nonAdminUsers);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(selectedUser._id);
      await adminService.deleteUser(selectedUser._id);
      toast.success(`User ${selectedUser.firstName} ${selectedUser.lastName} deleted successfully`);
      setShowConfirmModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const getRoleBadge = (role: string): string => {
    const roleColors: Record<string, string> = {
      tenant: 'bg-success',
      owner: 'bg-primary',
      agent: 'bg-info',
      admin: 'bg-danger',
      user: 'bg-secondary',
    };
    return roleColors[role] || 'bg-secondary';
  };

  const getStatusBadge = (isApproved: boolean): string => {
    return isApproved ? 'bg-success' : 'bg-warning';
  };

  return (
    <div className="user-deletion-page">
      <div className="container-fluid py-4">
        {/* Header */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="col-12">
            <h1 className="h3 mb-1">User Deletion Management</h1>
            <p className="text-muted mb-0">Remove users from the system for policy violations</p>
          </div>
        </motion.div>

        {/* Warning Alert */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> Deleting a user account is permanent and cannot be undone. All associated data will be removed from the system.
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="col-md-6 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="tenant">Tenant</option>
              <option value="owner">Owner</option>
              <option value="agent">Agent</option>
              <option value="user">User</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-zambia-green" role="status">
              <span className="visually-hidden">Loading users...</span>
            </div>
            <p className="text-muted mt-3">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3 d-block"></i>
              <h5>No users found</h5>
              <p className="text-muted mb-0">Try adjusting your search or filters</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="table-responsive">
              <table className="table table-hover shadow-sm">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <td>
                        <strong>{user.firstName} {user.lastName}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${getRoleBadge(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(user.isApproved)}`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <small>{new Date(user.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteClick(user)}
                          disabled={deleting === user._id}
                        >
                          {deleting === user._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-trash me-1"></i>
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && selectedUser && (
          <motion.div
            className="modal d-block"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="modal-dialog modal-dialog-centered"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Confirm User Deletion
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowConfirmModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-3">
                    Are you sure you want to <strong>permanently delete</strong> this user?
                  </p>
                  <div className="card bg-light">
                    <div className="card-body">
                      <p className="mb-2">
                        <strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong> {selectedUser.email}
                      </p>
                      <p className="mb-2">
                        <strong>Role:</strong> <span className={`badge ${getRoleBadge(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </p>
                      <p className="mb-0">
                        <strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-danger mb-0">
                    <i className="fas fa-warning me-2"></i>
                    This action cannot be undone. All associated data will be permanently deleted.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={deleting !== null}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmDelete}
                    disabled={deleting !== null}
                  >
                    {deleting === selectedUser._id ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash me-2"></i>
                        Yes, Delete User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserDeletion;
