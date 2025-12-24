import React, { useState } from 'react';
import api from '../config/api';
import './css/RoleEditModal.css';

const RoleEditModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put(`/users/${user.id}/role`, {
        role: parseInt(selectedRole)
      });

      if (response.data.success) {
        setSuccess('Role updated successfully!');
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const rolePermissions = {
    0: {
      name: 'Admin',
      pages: [
        'Dashboard',
        'Profile',
        'User Management',
        'Activities',
        'History',
        'Settings',
        'AI Chat'
      ]
    },
    1: {
      name: 'Volunteer',
      pages: [
        'Dashboard',
        'Profile',
        'Activities',
        'History',
        'Settings',
        'AI Chat'
      ]
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit User Role</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="user-info">
            <p><strong>User:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Current Role:</strong> {rolePermissions[user.role]?.name || 'Volunteer'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">Select Role:</label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-select"
              >
                <option value={0}>Admin</option>
                <option value={1}>Volunteer</option>
              </select>
            </div>

            <div className="permissions-preview">
              <h3>Permissions for {rolePermissions[selectedRole]?.name}:</h3>
              <ul className="permissions-list">
                {rolePermissions[selectedRole]?.pages.map((page, index) => (
                  <li key={index}>{page}</li>
                ))}
              </ul>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={loading || selectedRole == user.role}>
                {loading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleEditModal;

