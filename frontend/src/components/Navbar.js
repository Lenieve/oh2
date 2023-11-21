import React from 'react';
import './Navbar.css'; // Ensure you have this CSS file
import { Link } from 'react-router-dom';

const Sidebar = () => {
  
  const userRole = localStorage.getItem('userRole');
  console.log('Current user role in Navbar:', userRole);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Office Hooray</h1>
      </div>
      <nav className="nav-menu">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link">
              <span className="icon">🏠</span>
              <span className="title">Dashboard</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/account" className="nav-link">
              <span className="icon">👤</span>
              <span className="title">Account</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to={userRole === 'Ausbilder' ? '/manage-azubis' : '/wishlist'} className="nav-link">
              <span className="icon">{userRole === 'Ausbilder' ? '🧑‍🏫' : '📝'}</span>
              <span className="title">{userRole === 'Ausbilder' ? 'Manage Azubis' : 'Edit Wishlist'}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
