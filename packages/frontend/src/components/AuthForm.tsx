import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate(`/profile/${username}`);
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(username, password);
      
      if (result.success) {
        navigate(`/profile/${username}`);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-form">
      <div className="auth-card">
        <h2>Welcome to Tweeper</h2>
        {error && (
          <div style={{ 
            color: 'var(--record-color)', 
            marginBottom: 'var(--spacing-md)', 
            textAlign: 'center',
            fontSize: 'var(--font-size-sm)'
          }}>
            {error}
          </div>
        )}
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
              disabled={isLoading}
              minLength={3}
              maxLength={20}
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
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <div className="auth-buttons">
            <button 
              type="submit" 
              className="login-btn"
              onClick={handleLogin}
              disabled={isLoading || !username || !password}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <button 
              type="button" 
              className="signup-btn"
              onClick={handleSignup}
              disabled={isLoading || !username || !password}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm; 