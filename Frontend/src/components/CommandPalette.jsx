import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MdDashboard, MdWork, MdPerson, MdDarkMode, MdLightMode, MdClose, MdFileDownload, MdAdd } from 'react-icons/md';

const CommandPalette = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, theme, toggleTheme } = useAppContext();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const handleAction = (action) => {
    action();
    setCommandPaletteOpen(false);
    setSearch('');
  };

  const actions = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: <MdDashboard />, action: () => navigate('/dashboard') },
    { id: 'jobs', label: 'Go to Jobs', icon: <MdWork />, action: () => navigate('/jobs') },
    { id: 'profile', label: 'Go to Profile', icon: <MdPerson />, action: () => navigate('/profile') },
    { id: 'theme', label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, icon: theme === 'light' ? <MdDarkMode /> : <MdLightMode />, action: toggleTheme },
  ];

  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="command-palette-overlay" onClick={() => setCommandPaletteOpen(false)}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette__header">
          <input
            type="text"
            autoFocus
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="command-palette__close" onClick={() => setCommandPaletteOpen(false)}>
            <MdClose />
          </button>
        </div>
        <div className="command-palette__list">
          {filteredActions.length > 0 ? (
            filteredActions.map(action => (
              <div
                key={action.id}
                className="command-palette__item"
                onClick={() => handleAction(action.action)}
              >
                <span className="command-palette__icon">{action.icon}</span>
                <span>{action.label}</span>
              </div>
            ))
          ) : (
            <div className="command-palette__empty">No commands found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
