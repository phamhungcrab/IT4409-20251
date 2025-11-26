/**
 * Sidebar navigation component.
 *
 * This component renders a vertical list of navigation links.  Each link
 * automatically applies an active style when its path matches the current URL
 * thanks to `NavLink`.  You can pass a list of links via props or hard-code
 * them here.  Icons may be provided as React elements (e.g. from heroicons).
 */

import React from 'react';
import { NavLink } from 'react-router-dom';

export interface SidebarLink {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  links: SidebarLink[];
}

const Sidebar: React.FC<SidebarProps> = ({ links }) => {
  return (
    <aside className="w-64 bg-white border-r p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              [
                'block p-2 rounded-md transition-colors',
                isActive ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-100',
              ].join(' ')
            }
          >
            {link.icon && <span className="inline-block mr-2">{link.icon}</span>}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;