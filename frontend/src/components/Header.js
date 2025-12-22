import React from 'react';
import './css/Header.css';

const Header = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Dashboard User</h1>
      </div>
    </header>
  );
};

export default Header;

