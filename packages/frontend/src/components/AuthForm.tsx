import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logged in as ${username}`);
    navigate('/profile/oleks');
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Account created for ${username}`);
    navigate('/profile/oleks');
  };
  
  return (
    <div className="auth-form">
      <div className="auth-card">
        <h2>Welcome to Tweeper</h2>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              aria-required="true"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              aria-required="true"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="auth-buttons">
            <button 
              type="submit" 
              className="login-btn"
              onClick={handleLogin}
            >
              Login
            </button>
            <button 
              type="button" 
              className="signup-btn"
              onClick={handleSignup}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm; 