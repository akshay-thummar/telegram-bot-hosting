import React, { useState } from 'react';
import Header from './Common/Header';
import Sidebar from './Common/Sidebar';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    navigate('/login');
  };

  return (
    <div className="layout">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
      <div className="layout-container">
        {/* <Sidebar isOpen={sidebarOpen} /> */}
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;