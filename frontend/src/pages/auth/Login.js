import React from 'react';
import '../../css/authcss.css'; // This is the relative path to your CSS file

export default function LoginPage() {
  // Component logic
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome</h2>
        <div className="user-icon">oH</div>
        <form>
          <div className="input-container">
            <input type="email" id="email" name="email" placeholder="Email" required />
          </div>
          <div className="input-container">
            <input type="password" id="password" name="password" placeholder="Password" required />
            <span className="password-toggle-icon">👁️</span>
          </div>
          <button type="submit" className="login-btn">LOGIN</button>
        </form>
        <div className="signup-link">
          Don't have an account? <a href="/signup">Sign Up</a>
        </div>
      </div>
    </div>
  );
}
