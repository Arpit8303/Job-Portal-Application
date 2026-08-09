import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MdDashboard, MdWork, MdPerson, MdLogout, MdMenu, MdClose, MdDarkMode, MdLightMode, MdSearch } from 'react-icons/md';
import logoSvg from '../assets/jobLedger-logo.svg';
import NotificationBell from './NotificationBell';

const Layout = () => {
  const { auth, logoutUser, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard /> },
    { path: '/jobs', label: 'Jobs', icon: <MdWork /> },
    { path: '/search', label: 'Search', icon: <MdSearch /> },
    { path: '/profile', label: 'Profile', icon: <MdPerson /> },
  ];

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h2 className="sidebar__logo">
            <img src={logoSvg} alt="JobLedger" className="logo-image" /> JobLedger
          </h2>
          <button className="sidebar__close" onClick={() => setSidebarOpen(false)}>
            <MdClose />
          </button>
        </div>
        <nav className="sidebar__nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar__link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <button className="sidebar__logout" onClick={handleLogout}>
            <MdLogout /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setSidebarOpen(true)}>
            <MdMenu />
          </button>
          <div className="topbar__user">
            <button className="btn btn--ghost" onClick={toggleTheme} style={{ padding: '8px', fontSize: '20px' }} title="Toggle Theme">
              {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
            </button>
            <NotificationBell />
            <div className="topbar__avatar">
              {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="topbar__name">{auth.user?.name || 'User'}</span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
