import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UserIcon, ActivitiesIcon, HistoryIcon, SettingsIcon, PlusIcon, MobileIcon, MessagesIcon } from './Icons';
import './css/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const menuItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
    { path: '/chat', icon: MessagesIcon, label: 'AI Chat' },
    { path: '/activities', icon: ActivitiesIcon, label: 'Activities' },
    { path: '/history', icon: HistoryIcon, label: 'History' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  if (!token) {
    return null;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <span className="logo-text-inner">V+</span>
          </div>
          <span className="logo-brand">Volunteer Connect</span>
        </div>

        {/* New Activity Button */}
        <button className="new-activity-btn">
          <PlusIcon className="plus-icon" />
          <span>New Activity</span>
        </button>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Get Mobile App Section */}
        <div className="mobile-app-section">
          <MobileIcon className="mobile-app-icon" />
          <span className="mobile-app-text">Get mobile app</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
