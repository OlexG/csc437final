import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <header className="navbar">
      <div className="brand">
        <Link to="/"><h1>Tweeper</h1></Link>
      </div>
      <div className="nav-links">
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