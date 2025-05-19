import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  
  useEffect(() => {
    // Apply dark mode class to body on mount and when darkMode changes
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <header className="navbar">
      <div className="brand">
        <Link to="/"><h1>Tweeper</h1></Link>
      </div>
      <div className="nav-links">
        <button 
          onClick={toggleDarkMode} 
          className="theme-toggle"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
        </button>
        <Link 
          to="/auth" 
          className={`demo-link ${location.pathname === '/auth' ? 'active' : ''}`}
        >
          (Demo) Sign Up / Login
        </Link>
        <Link 
          to="/profile/oleks" 
          className={`user-profile ${location.pathname === '/profile/oleks' ? 'active' : ''}`}
        >
          oleks
        </Link>
      </div>
    </header>
  );
};

export default Navbar; 