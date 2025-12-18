import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Here's your dashboard overview</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Profile</h3>
          <p>View and update your profile information</p>
          <button onClick={() => navigate('/profile')} className="card-btn">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

