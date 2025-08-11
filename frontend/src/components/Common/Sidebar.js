import React from 'react';

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul>
          <li className="nav-item active">
            <a href="/dashboard" className="nav-link">
              <span className="nav-icon dashboard-icon"></span>
              <span className="nav-text">Dashboard</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="/bots" className="nav-link">
              <span className="nav-icon bots-icon"></span>
              <span className="nav-text">My Bots</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="/settings" className="nav-link">
              <span className="nav-icon settings-icon"></span>
              <span className="nav-text">Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;