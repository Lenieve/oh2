import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/authcss.css'; // Make sure this path is correct
import { jwtDecode } from 'jwt-decode';



function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
  
    console.log("Attempting to log in with", { username, password });
  
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password
      });
  
      console.log("Login response:", response);
  
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Decode the token to get the user role
        const decoded = jwtDecode(response.data.token);
        console.log('Decoded JWT:', decoded);
        
        // Assuming the role is inside the 'data' property in the decoded token
        const userRole = decoded.data.role;
        console.log('User role from token:', userRole);
        localStorage.setItem('userRole', userRole);
      
        navigate('/dashboard');
      } else {
        console.error('Login failed:', response.data.message);
      }
    } catch (error) {
      // Handle any errors that occur during login
      console.error('An error occurred during login:', error);
    }
  };

  return (
    <div className="background">
      <div className="login-box">
        <p className="title">Office Hooray</p>
        <p className="welcome-back">welcome back</p>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="account-actions">
            <p className="register-now">Don't have an account yet? <a href="/register">Register Now</a></p>
            <button type="submit" className="login-button">LOGIN</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
