import { NavLink } from 'react-router-dom';
import { Gamepad2, Trophy, Files } from 'lucide-react';
import AccountWidget from './AccountWidget';

const navItems = [
  { to: '/lobby', label: 'Game Lobby', icon: Gamepad2 },
  { to: '/vault', label: 'My Games', icon: Trophy },
];

const Sidebar = () => {
  return (
    <aside className="sidebar-container w-64 flex flex-col">
      {/* Enhanced Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-content">
          <div className="sidebar-logo-icon">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <span className="sidebar-logo-text">
            TicTacToe Arena
          </span>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${
                isActive ? 'active' : ''
              }`
            }
          >
            <Icon className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Enhanced Account widget */}
      <div className="p-4 border-t border-surface-tonal-a20">
        <AccountWidget />
      </div>
    </aside>
  );
};

export default Sidebar;
