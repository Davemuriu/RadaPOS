import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Shield, 
  ShieldCheck 
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Events', icon: <Calendar size={20} />, path: '/admin/events' },
    { name: 'Vendors', icon: <Users size={20} />, path: '/admin/vendors' },
    { name: 'Admin Users', icon: <Shield size={20} />, path: '/admin/users' }, // Uses Shield icon
    { name: 'Reports', icon: <FileText size={20} />, path: '/admin/reports' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="w-64 bg-[#11141A] border-r border-gray-800 flex flex-col min-h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">R</div>
          <span className="text-xl font-bold tracking-tight text-white">RadaPOS</span>
        </div>
        
        <div className="mb-10 px-2">
          <p className="text-[10px] uppercase text-gray-500 font-bold mb-1 tracking-widest">Access Level</p>
          <p className="text-sm text-indigo-400 truncate font-medium flex items-center gap-2">
             <ShieldCheck size={14} /> {user?.role || 'Administrator'}
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          Logout Session
        </button>
      </div>
    </div>
  );
};

export default function AdminShell({ user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-[#0B0E11]">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
}