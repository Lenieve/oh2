import React from 'react';
import './Navbar.css'; // Ensure you have this CSS file

const Sidebar = () => {
  
  const userRole = localStorage.getItem('userRole');
  console.log("Current user role in Navbar:", userRole);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Office Hooray</h1>
      </div>
      <nav className="nav-menu">
        <ul className="nav-list">
          <li className="nav-item">
            <span className="icon">🏠</span>
            <span className="title">Dashboard</span>
          </li>
          <li className="nav-item">
            <span className="icon">👤</span>
            <span className="title">Account</span>
          </li>
          <li className="nav-item">
            <span className="icon">{userRole === 'Ausbilder' ? '🧑‍🏫' : '📝'}</span>
            <span className="title">{userRole === 'Ausbilder' ? 'Manage Azubis' : 'Edit Wishlist'}</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
