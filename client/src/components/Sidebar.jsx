import { NavLink } from 'react-router-dom';
import { Gamepad2, Trophy, Files } from 'lucide-react';
import AccountWidget from './AccountWidget';

const navItems = [
  { to: '/lobby', label: 'Game Lobby', icon: Gamepad2 },
  { to: '/vault', label: 'My Games', icon: Trophy },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-surface-tonal-a0 border-r border-surface-tonal-a20 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-tonal-a20">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-primary-a20" />
          <span className="font-heading font-bold text-lg text-primary-a40">
            TicTacToe Arena
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-label text-sm mb-1 transition-colors ${
                isActive
                  ? 'bg-primary-a0 text-white font-semibold'
                  : 'text-surface-a50 hover:bg-surface-tonal-a10 hover:text-primary-a40'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Account widget */}
      <div className="p-3 border-t border-surface-tonal-a20">
        <AccountWidget />
      </div>
    </aside>
  );
};

export default Sidebar;
