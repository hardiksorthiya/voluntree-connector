import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/Home';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import ListUser from './pages/ListUsers';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import ForgotPassword from './pages/ForgotPassword';
import PermissionsManagement from './pages/PermissionsManagement';
import RoleManagement from './pages/RoleManagement';

// Component to conditionally show Sidebar and Header
const AppContent = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';
  const showLayout = token && !isAuthPage;

  return (
    <div className="App">
      {showLayout && <Sidebar />}
      {showLayout && <Header />}
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<ListUser />} />
        <Route path="/permissions" element={<PermissionsManagement />} />
        <Route path="/roles" element={<RoleManagement />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/:id" element={<ActivityDetail />} />
        <Route path="/history" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

