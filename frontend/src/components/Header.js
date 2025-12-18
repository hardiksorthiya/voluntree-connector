import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!token) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        
        <div className="header-right">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
          </button>
          
          <div className="user-menu">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-dropdown">▼</span>
            </div>
            <div className="user-dropdown-menu">
              <button onClick={handleLogout} className="dropdown-item">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

