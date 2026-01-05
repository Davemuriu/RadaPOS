import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminShell = ({ title, children }) => {
  const { pathname } = useLocation();
  const menu = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Events', path: '/admin/events' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Vendors', path: '/admin/vendors' },
    { name: 'Reports', path: '/admin/reports' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1 className="admin-brand-title">Rada</h1>
        </div>
        <nav className="admin-nav">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${pathname === item.path ? 'admin-nav-item-active' : 'admin-nav-item-idle'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="admin-signout-wrap">
          <button className="admin-signout-btn">Sign Out</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h2 className="admin-title">{title}</h2>
          <div className="admin-search-wrap">
            <span className="admin-search-icon">🔍</span>
            <input type="text" className="admin-search-input" placeholder="SEARCH..." />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AdminShell;