import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, UserIcon, ActivitiesIcon, HistoryIcon, SettingsIcon, PlusIcon, MobileIcon, MessagesIcon } from './Icons';
import api from '../config/api';
import './css/Sidebar.css';

// Icon mapping
const iconMap = {
  HomeIcon,
  UserIcon,
  ActivitiesIcon,
  HistoryIcon,
  SettingsIcon,
  MessagesIcon,
  FileIcon: SettingsIcon,
  NotificationIcon: SettingsIcon,
  CalendarIcon: SettingsIcon,
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUserManagementAccess, setHasUserManagementAccess] = useState(false);

  // Get user role
  const getUserRole = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role !== undefined ? Number(user.role) : (user.user_type === 'admin' ? 0 : 1);
      } catch (e) {
        return 1; // Default to volunteer
      }
    }
    return 1; // Default to volunteer
  };

  const userRole = getUserRole();
  const isAdmin = userRole === 0;

  // Check permissions and set menu items
  useEffect(() => {
    if (!token) return;
    
    const checkPermissions = async () => {
      let hasAccess = false;
      try {
        // Check user management permission
        const permissionResponse = await api.get('/permissions/check/user_management');
        if (permissionResponse.data.success && permissionResponse.data.hasAccess) {
          hasAccess = true;
        }
      } catch (err) {
        // If admin, assume access (backend will handle it)
        if (isAdmin) {
          hasAccess = true;
        }
      }
      
      setHasUserManagementAccess(hasAccess);
      
      // Build menu items with current access state
      const defaultItems = [
        { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', adminOnly: false },
        { path: '/profile', icon: UserIcon, label: 'Profile', adminOnly: false },
        { path: '/chat', icon: MessagesIcon, label: 'AI Chat', adminOnly: false },
        { path: '/activities', icon: ActivitiesIcon, label: 'Activities', adminOnly: false },
        { path: '/history', icon: HistoryIcon, label: 'History', adminOnly: false },
        { path: '/settings', icon: SettingsIcon, label: 'Settings', adminOnly: false },
      ];

      // Add User Management if user has permission
      if (hasAccess) {
        defaultItems.push(
          { path: '/users', icon: UserIcon, label: 'User Management', adminOnly: true }
        );
      }

      // Add Permissions Management for admins only
      if (isAdmin) {
        defaultItems.push(
          { path: '/permissions', icon: SettingsIcon, label: 'Permissions', adminOnly: true },
          { path: '/roles', icon: SettingsIcon, label: 'Roles', adminOnly: true }
        );
      }

      setMenuItems(defaultItems);
      setLoading(false);
    };
    
    checkPermissions();
  }, [token, isAdmin]);

  // Default menu items as fallback (used if menuItems is empty)
  const getDefaultMenuItems = () => {
    const defaultItems = [
      { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', adminOnly: false },
      { path: '/profile', icon: UserIcon, label: 'Profile', adminOnly: false },
      { path: '/chat', icon: MessagesIcon, label: 'AI Chat', adminOnly: false },
      { path: '/activities', icon: ActivitiesIcon, label: 'Activities', adminOnly: false },
      { path: '/history', icon: HistoryIcon, label: 'History', adminOnly: false },
      { path: '/settings', icon: SettingsIcon, label: 'Settings', adminOnly: false },
    ];

    // Add User Management if user has permission (fallback: admin only)
    if (hasUserManagementAccess || isAdmin) {
      defaultItems.push(
        { path: '/users', icon: UserIcon, label: 'User Management', adminOnly: true }
      );
    }

    // Add Permissions Management for admins only
    if (isAdmin) {
      defaultItems.push(
        { path: '/permissions', icon: SettingsIcon, label: 'Permissions', adminOnly: true },
        { path: '/roles', icon: SettingsIcon, label: 'Roles', adminOnly: true }
      );
    }

    return defaultItems;
  };

  const handleLogout = () => {
    // remove common auth keys so both volunteer and admin get logged out
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    // navigate to login page
    navigate('/login');
  };

  if (!token) {
    return null;
  }

  // Show loading state or default items
  const displayItems = menuItems.length > 0 ? menuItems : (loading ? [] : getDefaultMenuItems());

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
          {displayItems.map((item) => {
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

          {/* Logout button (not a Link) */}
          <button
            type="button"
            className="nav-item logout-item"
            onClick={handleLogout}
            aria-label="Logout"
          >
            {/* simple inline logout icon */}
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19H6C4.89543 19 4 18.1046 4 17V7C4 5.89543 4.89543 5 6 5H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-label">Logout</span>
          </button>
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
