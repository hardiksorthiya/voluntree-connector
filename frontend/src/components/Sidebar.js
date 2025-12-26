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
  const [hasActivityManagementAccess, setHasActivityManagementAccess] = useState(false);
  const [hasAiChatAccess, setHasAiChatAccess] = useState(false);

  // Get user role and check if admin
  const getUserInfo = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Check if user_type is admin (case-insensitive)
        const isAdminByType = user.user_type && user.user_type.toLowerCase() === 'admin';
        
        // Get role - handle null, undefined, string, or number
        let role = 1; // Default to volunteer
        if (user.role !== null && user.role !== undefined) {
          role = Number(user.role);
        } else if (isAdminByType) {
          role = 0; // Admin role
        }
        
        // User is admin if role is 0 OR user_type is admin
        const isAdmin = role === 0 || isAdminByType;
        
        return { role, isAdmin };
      } catch (e) {
        console.error('Error parsing user data:', e);
        return { role: 1, isAdmin: false };
      }
    }
    return { role: 1, isAdmin: false };
  };

  const { role: userRole, isAdmin } = getUserInfo();

  // Function to refresh user data from server
  const refreshUserData = async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        console.log('[SIDEBAR] User data refreshed from server:', response.data.data);
        return response.data.data;
      }
    } catch (err) {
      console.error('[SIDEBAR] Error refreshing user data:', err);
    }
    return null;
  };

  // Check permissions and set menu items
  useEffect(() => {
    if (!token) return;
    
    // Get current user info to ensure we have the latest role
    const userData = localStorage.getItem('user');
    const currentUser = userData ? JSON.parse(userData) : null;
    const currentRole = currentUser?.role !== undefined ? Number(currentUser.role) : (currentUser?.user_type === 'admin' ? 0 : 1);
    
    console.log('[SIDEBAR] Checking permissions for user:', {
      user_id: currentUser?.id,
      user_type: currentUser?.user_type,
      role: currentRole,
      isAdmin: currentRole === 0
    });
    
    const checkPermissions = async () => {
      // Refresh user data first to ensure we have the latest role
      const refreshedUser = await refreshUserData();
      const userToCheck = refreshedUser || currentUser;
      const userRole = userToCheck?.role !== undefined ? Number(userToCheck.role) : (userToCheck?.user_type === 'admin' ? 0 : 1);
      
      console.log('[SIDEBAR] Using role for permission check:', userRole);
      setLoading(true);
      // Check all permissions
      let userMgmtAccess = false;
      let activityMgmtAccess = false;
      let aiChatAccess = false;
      
      // Check user management permission
      try {
        const userMgmtResponse = await api.get('/permissions/check/user_management');
        console.log('[SIDEBAR] User Management check response:', userMgmtResponse.data);
        if (userMgmtResponse.data.success && userMgmtResponse.data.hasAccess) {
          userMgmtAccess = true;
          console.log('✅ User Management permission: GRANTED');
        } else {
          console.log('❌ User Management permission: DENIED', userMgmtResponse.data);
        }
      } catch (err) {
        console.error('[SIDEBAR] Error checking user_management permission:', err.response?.data || err.message);
        // If admin, assume access (backend will handle it)
        if (isAdmin) {
          userMgmtAccess = true;
          console.log('✅ User Management permission: GRANTED (admin fallback)');
        } else {
          console.log('❌ User Management permission: DENIED (error)');
        }
      }
      
      // Check activity management permission
      try {
        const activityMgmtResponse = await api.get('/permissions/check/activity_management');
        console.log('[SIDEBAR] Activity Management check response:', activityMgmtResponse.data);
        if (activityMgmtResponse.data.success && activityMgmtResponse.data.hasAccess) {
          activityMgmtAccess = true;
          console.log('✅ Activity Management permission: GRANTED');
        } else {
          console.log('❌ Activity Management permission: DENIED', activityMgmtResponse.data);
        }
      } catch (err) {
        console.error('[SIDEBAR] Error checking activity_management permission:', err.response?.data || err.message);
        // If admin, assume access (backend will handle it)
        if (isAdmin) {
          activityMgmtAccess = true;
          console.log('✅ Activity Management permission: GRANTED (admin fallback)');
        } else {
          console.log('❌ Activity Management permission: DENIED (error)');
        }
      }
      
      // Check AI chat permission
      try {
        const aiChatResponse = await api.get('/permissions/check/ai_chat');
        console.log('[SIDEBAR] AI Chat check response:', aiChatResponse.data);
        if (aiChatResponse.data.success && aiChatResponse.data.hasAccess) {
          aiChatAccess = true;
          console.log('✅ AI Chat permission: GRANTED');
        } else {
          console.log('❌ AI Chat permission: DENIED', aiChatResponse.data);
        }
      } catch (err) {
        console.error('[SIDEBAR] Error checking ai_chat permission:', err.response?.data || err.message);
        // If admin, assume access (backend will handle it)
        if (isAdmin) {
          aiChatAccess = true;
          console.log('✅ AI Chat permission: GRANTED (admin fallback)');
        } else {
          console.log('❌ AI Chat permission: DENIED (error)');
        }
      }
      
      console.log('[SIDEBAR] Final permission state:', {
        userMgmtAccess,
        activityMgmtAccess,
        aiChatAccess
      });
      
      setHasUserManagementAccess(userMgmtAccess);
      setHasActivityManagementAccess(activityMgmtAccess);
      setHasAiChatAccess(aiChatAccess);
      
      // Build menu items with current access state
      const defaultItems = [
        { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', adminOnly: false },
        { path: '/profile', icon: UserIcon, label: 'Profile', adminOnly: false },
      ];

      // Add AI Chat if user has permission
      if (aiChatAccess) {
        defaultItems.push(
          { path: '/chat', icon: MessagesIcon, label: 'AI Chat', adminOnly: false }
        );
        console.log('[SIDEBAR] Added AI Chat menu item');
      }

      // Add Activities if user has permission
      if (activityMgmtAccess) {
        defaultItems.push(
          { path: '/activities', icon: ActivitiesIcon, label: 'Activities', adminOnly: false }
        );
        console.log('[SIDEBAR] Added Activities menu item');
      }

      // Add User Management if user has permission
      if (userMgmtAccess) {
        defaultItems.push(
          { path: '/users', icon: UserIcon, label: 'User Management', adminOnly: true }
        );
        console.log('[SIDEBAR] Added User Management menu item');
      }

      // Add Roles Management for admins only
      if (isAdmin) {
        defaultItems.push(
          { path: '/roles', icon: SettingsIcon, label: 'Roles', adminOnly: true }
        );
        console.log('[SIDEBAR] Added Roles menu item');
      }

      console.log('[SIDEBAR] Final menu items:', defaultItems.map(item => item.label));
      setMenuItems(defaultItems);
      setLoading(false);
    };
    
    checkPermissions();
    
    // Listen for storage events to refresh when user data changes (e.g., after role update)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        console.log('[SIDEBAR] User data changed, refreshing permissions...');
        checkPermissions();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event to refresh permissions
    const handlePermissionRefresh = () => {
      console.log('[SIDEBAR] Permission refresh event received');
      checkPermissions();
    };
    
    window.addEventListener('permissionsUpdated', handlePermissionRefresh);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('permissionsUpdated', handlePermissionRefresh);
    };
  }, [token, isAdmin, location.pathname]); // Added location.pathname to refresh when navigating

  // Default menu items as fallback (used if menuItems is empty)
  const getDefaultMenuItems = () => {
    const defaultItems = [
      { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', adminOnly: false },
      { path: '/profile', icon: UserIcon, label: 'Profile', adminOnly: false },
    ];

    // Add AI Chat if user has permission (fallback: admin only)
    if (hasAiChatAccess || isAdmin) {
      defaultItems.push(
        { path: '/chat', icon: MessagesIcon, label: 'AI Chat', adminOnly: false }
      );
    }

    // Add Activities if user has permission (fallback: admin only)
    if (hasActivityManagementAccess || isAdmin) {
      defaultItems.push(
        { path: '/activities', icon: ActivitiesIcon, label: 'Activities', adminOnly: false }
      );
    }

    // Add User Management if user has permission (fallback: admin only)
    if (hasUserManagementAccess || isAdmin) {
      defaultItems.push(
        { path: '/users', icon: UserIcon, label: 'User Management', adminOnly: true }
      );
    }

    // Add Roles Management for admins only
    if (isAdmin) {
      defaultItems.push(
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
