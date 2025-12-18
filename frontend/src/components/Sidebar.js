import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './css/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', show: token },
    { path: '/profile', icon: '👤', label: 'Profile', show: token },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <span className="logo-icon">🤝</span>
          <span className="logo-text">Volunteer Connect</span>
        </div>

        {token && (
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              if (!item.show) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="sidebar-footer">
          <div className="mobile-app-section">
            <div className="mobile-app-illustration">
              <span className="mobile-icon">📱</span>
            </div>
            <p className="mobile-app-text">Get mobile app</p>
            <div className="app-stores">
              <span className="store-icon">📱</span>
              <span className="store-icon">🍎</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

