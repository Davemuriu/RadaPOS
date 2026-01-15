import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Shield,
  ShieldCheck,
  Wallet,
  Package,
  ShoppingCart,
  History,
  UserCircle,
  Zap,
  CreditCard
} from 'lucide-react';
import '../styles/Components/Sidebar.css';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Normalize role to handle case sensitivity and default to 'GUEST'
  const userRole = (user?.role || 'GUEST').toUpperCase();

  const getMenuItems = () => {
    switch (userRole) {
      case 'ADMIN':
      case 'ADMINISTRATOR':
        return [
          { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
          { name: 'Events', icon: <Calendar size={20} />, path: '/admin/events' },
          { name: 'Vendors', icon: <Users size={20} />, path: '/admin/vendors' },
          { name: 'Global Wallet', icon: <Wallet size={20} />, path: '/admin/wallet' },
          { name: 'Admin Users', icon: <Shield size={20} />, path: '/admin/users' },
          { name: 'Reports', icon: <FileText size={20} />, path: '/admin/reports' },
          { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
        ];
      case 'VENDOR':
        return [
          { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/vendor/dashboard' },
          { name: 'POS Terminal', icon: <ShoppingCart size={20} />, path: '/vendor/pos' },
          { name: 'Inventory', icon: <Package size={20} />, path: '/vendor/inventory' },
          { name: 'Staff', icon: <UserCircle size={20} />, path: '/vendor/staff' },
          { name: 'My Wallet', icon: <Wallet size={20} />, path: '/vendor/wallet' },
          { name: 'History', icon: <History size={20} />, path: '/vendor/sales' },
          { name: 'Settings', icon: <Settings size={20} />, path: '/vendor/settings' },
        ];
      case 'CASHIER':
        return [
          { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/cashier/dashboard' },
          { name: 'POS Terminal', icon: <ShoppingCart size={20} />, path: '/cashier/pos' },
          { name: 'History', icon: <History size={20} />, path: '/cashier/history' },
          { name: 'Settings', icon: <Settings size={20} />, path: '/cashier/settings' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon-bg">
            <Zap size={22} fill="currentColor" />
          </div>
          <div className="logo-text-wrapper">
            <span className="logo-main">RadaPOS</span>
            <span className="logo-sub">Enterprise</span>
          </div>
        </div>

        {/* User Access Badge */}
        <div className={`user-badge-container ${userRole.toLowerCase()}`}>
          <p className="badge-label">ACCESS LEVEL</p>
          <div className="user-badge">
            <ShieldCheck size={14} />
            <span>{userRole}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;