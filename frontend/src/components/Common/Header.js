import React from 'react';
import Button from './Button';

const Header = ({ onMenuClick, onLogout }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <span className="hamburger-icon"></span>
        </button>
        <h1 className="header-title">Bot Hosting Platform</h1>
      </div>
      <div className="header-right">
        <Button variant="outline" onClick={onLogout}>Logout</Button>
      </div>
    </header>
  );
};

export default Header;