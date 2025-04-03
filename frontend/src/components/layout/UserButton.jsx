import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function UserButton() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="user-button-container">
      <button 
        className="user-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div className="user-avatar">
          {user?.name?.charAt(0)}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </div>
        </div>
        <div className="user-chevron">▼</div>
      </button>
      
      {menuOpen && (
        <div className="user-menu">
          <div className="user-menu-label">Account</div>
          <Link 
            to="/profile" 
            className="user-menu-item"
            onClick={() => setMenuOpen(false)}
          >
            👤 Profile
          </Link>
          <div className="user-menu-divider"></div>
          <button 
            className="user-menu-item user-menu-item-danger"
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserButton;