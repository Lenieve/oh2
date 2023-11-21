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
      <div className="app-container"> {/* Use app-container class here */}
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<LayoutWithNavbar />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* ... other routes that should include the Navbar ... */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

const LayoutWithNavbar = () => {
  const location = useLocation();
  const showNavbar = !['/login', '/register'].includes(location.pathname);

  return (
    <>
      {showNavbar && (
        <div className="navbar-container"> {/* Use navbar-container class here */}
          <Navbar />
        </div>
      )}
      <div className="main-content-container"> {/* Use main-content-container class here */}
        <Outlet /> {/* The main content rendered by the router */}
      </div>
    </>
  );
};

export default App;
