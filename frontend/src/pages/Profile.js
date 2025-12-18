import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../css/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
          name: response.data.data.name,
          phone: response.data.data.phone || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await api.put('/users/me', formData);
      if (response.data.success) {
        setUser(response.data.data);
        setMessage('Profile updated successfully!');
        setEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
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
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary">
              Edit Profile
            </button>
          )}
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Changes</button>
              <button 
                type="button" 
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user?.name || '',
                    phone: user?.phone || ''
                  });
                  setError('');
                }} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <label>Name</label>
              <p>{user?.name}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>{user?.phone || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <label>User Type</label>
              <p className="user-type">{user?.user_type}</p>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <p>{new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

