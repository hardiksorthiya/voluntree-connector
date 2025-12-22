import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { SearchIcon, EditIcon, UserIcon, EyeIcon, EyeOffIcon, LockIcon } from '../components/Icons';
import '../css/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock data for activities and tasks
  const [activities] = useState([
    { id: 1, name: 'Active Activity', account: '8040 5000 8008 4525', status: 'active' },
    { id: 2, name: 'Completed Activity', account: '7582 5689 3543 2548', status: 'completed' },
  ]);

  const [tasks] = useState([
    { id: 1, name: 'Community Cleanup', status: 'completed', paid: true },
    { id: 2, name: 'Food Drive', status: 'pending', paid: false },
    { id: 3, name: 'Education Workshop', status: 'completed', paid: true },
    { id: 4, name: 'Health Check-up', status: 'completed', paid: true },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUser();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data.success) {
        setUser(response.data.data);
        setFormData({
          name: response.data.data.name || '',
          phone: response.data.data.phone || '',
          email: response.data.data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setMessage('');
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await api.put('/users/me', {
        name: formData.name,
        phone: formData.phone
      });
      if (response.data.success) {
        setUser(response.data.data);
        setMessage('Profile updated successfully!');
        setEditing(false);
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.data.success) {
        setPasswordMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getLastLogin = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }) + ', ' + now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-layout">
        {/* Main Profile Card */}
        <div className="profile-main-card">
          <div className="profile-avatar-large">
            <div className="avatar-circle">
              {user?.name ? (
                <span className="avatar-initials">{getInitials(user.name)}</span>
              ) : (
                <UserIcon className="avatar-icon" />
              )}
            </div>
          </div>

          <div className="profile-header-section">
            <div className="profile-title-row">
              <h2 className="profile-title">My profile</h2>
              {!editing && (
                <button onClick={handleEdit} className="edit-profile-btn">
                  <EditIcon className="edit-icon" />
                  <span>Edit</span>
                </button>
              )}
            </div>
            <div className="last-login-info">
              <span>Last Login: {getLastLogin()}</span>
              <span>Windows 10 pro, New York (US)</span>
            </div>
          </div>

          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-info-row">
              <div className="info-field">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={`profile-input ${!editing ? 'read-only' : ''}`}
                  readOnly={!editing}
                />
              </div>
              <div className="info-field">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={`profile-input ${!editing ? 'read-only' : ''}`}
                  readOnly={!editing}
                />
              </div>
            </div>

            <div className="profile-info-row">
              <div className="info-field full-width">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="profile-input disabled"
                  placeholder="Email Address"
                />
              </div>
            </div>

            {editing && (
              <div className="form-actions">
                <button type="submit" className="save-button">
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Password Change Form */}
          <div className="password-change-section">
            <h3 className="password-change-title">Change Password</h3>
            
            {passwordMessage && <div className="success-message">{passwordMessage}</div>}
            {passwordError && <div className="error-message">{passwordError}</div>}

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="password-field">
                <div className="password-input-wrapper">
                  <LockIcon className="password-field-icon" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Current Password"
                    className="password-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? (
                      <EyeOffIcon className="password-toggle-icon" />
                    ) : (
                      <EyeIcon className="password-toggle-icon" />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <div className="password-input-wrapper">
                  <LockIcon className="password-field-icon" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="New Password"
                    className="password-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <EyeOffIcon className="password-toggle-icon" />
                    ) : (
                      <EyeIcon className="password-toggle-icon" />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <div className="password-input-wrapper">
                  <LockIcon className="password-field-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm New Password"
                    className="password-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="password-toggle-icon" />
                    ) : (
                      <EyeIcon className="password-toggle-icon" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="change-password-button">
                Change Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="profile-side-cards">
          {/* My Activities Card */}
          <div className="profile-side-card">
            <div className="side-card-header">
              <h3>My Activities</h3>
              <div className="side-card-actions">
                <SearchIcon className="action-icon" />
                <button className="edit-button">Edit</button>
              </div>
            </div>
            <div className="activities-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-status-label">
                      {activity.status === 'active' ? 'Active Activity' : 'Completed Activity'}
                    </span>
                    <span className="activity-account">{activity.account}</span>
                  </div>
                  <button 
                    className={`activity-action-btn ${activity.status === 'active' ? 'block' : 'unblock'}`}
                  >
                    {activity.status === 'active' ? 'Block Activity' : 'Unblock Activity'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* My Tasks Card */}
          <div className="profile-side-card">
            <div className="side-card-header">
              <h3>My Tasks</h3>
              <div className="filter-section">
                <span className="filter-label">Filter by</span>
              </div>
            </div>
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className={`task-status-dot ${task.paid ? 'paid' : 'unpaid'}`}></div>
                  <span className="task-name">{task.name}</span>
                  <button className={`task-status-btn ${task.paid ? 'paid' : 'unpaid'}`}>
                    {task.paid ? 'Task Completed' : 'Not Completed'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
