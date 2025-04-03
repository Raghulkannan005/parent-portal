import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainLinks from './MainLinks';

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
          <h1 className="app-title">Parent Portal</h1>
          <div className="user-info">
            {user?.name} ({user?.role})
          </div>
        </div>
      </header>

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <MainLinks />
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Parent Portal &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default Layout;