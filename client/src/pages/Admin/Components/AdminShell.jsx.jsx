import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminShell = ({ title, children }) => {
  const { pathname } = useLocation();
  const menu = [
    { name: 'POS_DASH', path: '/admin/dashboard' },
    { name: 'SESSIONS', path: '/admin/events' },
    { name: 'OPERATORS', path: '/admin/users' },
    { name: 'VENDORS', path: '/admin/vendors' },
    { name: 'LEDGER', path: '/admin/reports' },
    { name: 'SYSTEM', path: '/admin/settings' },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar border-r-2 border-rada-accent/20">
        <div className="admin-brand border-b border-border-soft">
          <h1 className="admin-brand-title text-rada-accent">RADAPOS <span className="text-[10px] text-white opacity-50">v2.6</span></h1>
        </div>
        
        <nav className="admin-nav py-4">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item text-xs tracking-widest ${
                pathname === item.path ? 'admin-nav-item-active' : 'admin-nav-item-idle'
              }`}
            >
              <span className="opacity-40">{pathname === item.path ? '●' : '○'}</span> {item.name}
            </Link>
          ))}
        </nav>

        <div className="admin-signout-wrap mt-auto bg-rada-void/50">
          <div className="text-[9px] text-slate-500 mb-2 px-2 uppercase font-mono">Terminal: T-01-A</div>
          <button className="admin-signout-btn border border-rada-danger/30">LOCK TERMINAL</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header border-b border-border-soft pb-6">
          <div>
            <h2 className="admin-title text-3xl">{title}</h2>
            <p className="text-[10px] text-rada-accent font-mono uppercase mt-1">Status: System_Optimal // Mode: Administrative</p>
          </div>
          <div className="admin-search-wrap">
            <input type="text" className="admin-search-input border-2 border-rada-accent/10 focus:border-rada-accent" placeholder="SCAN_SKU_OR_SEARCH..." />
          </div>
        </header>
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </section>
      </main>
    </div>
  );
};

export default AdminShell;