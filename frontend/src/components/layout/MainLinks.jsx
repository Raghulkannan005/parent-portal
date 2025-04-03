import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MainLinks() {
  const { user } = useAuth();
  
  const links = [
    { icon: '🏠', label: 'Dashboard', to: '/' },
    { icon: '👥', label: 'Students', to: '/students' },
    { icon: '📚', label: 'Homework', to: '/homework' },
    { icon: '💬', label: 'Messages', to: '/messages' },
    { icon: '👤', label: 'Profile', to: '/profile' },
  ];

  return (
    <div className="main-links">
      {links.map((link) => (
        <NavLink 
          to={link.to} 
          key={link.label}
          className={({ isActive }) => 
            `main-link ${isActive ? 'main-link-active' : ''}`
          }
        >
          <span className="main-link-icon">{link.icon}</span>
          <span className="main-link-text">{link.label}</span>
        </NavLink>
      ))}
    </div>
  );
}

export default MainLinks;
