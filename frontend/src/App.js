import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import DashboardPage from './pages/dashboard/common/Dashboard';
import Navbar from './components/Navbar'; // Ensure your import paths are correct
import './App.css'; // Import your App CSS

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<LayoutWithNavbar />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* ... other routes that should include the Navbar ... */}
        </Route>
      </Routes>
    </Router>
  );
};

const LayoutWithNavbar = () => {
  return (
    <div className="dashboard-container"> {/* Renamed class */}
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="main-content-container">
        <Outlet />
      </div>
    </div>
  );
};

export default App;