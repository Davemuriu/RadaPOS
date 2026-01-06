import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminShell({ user, onLogout }) {
  const navigate = useNavigate();

  // Updated to match the strings your API sends (administrator/admin)
  // Or you can map 'administrator' to 'SUPER_ADMIN' before passing it here
  const userRole = user?.admin_role || user?.role || "GUEST";

  const NAV_ITEMS = [
    { label: "Dashboard", path: "/admin/dashboard", roles: ["administrator", "admin", "SUPER_ADMIN", "MANAGER"] },
    { label: "Events", path: "/admin/events", roles: ["administrator", "admin", "SUPER_ADMIN"] },
    { label: "Vendors", path: "/admin/vendors", roles: ["administrator", "admin", "SUPER_ADMIN"] },
    { label: "Admin Users", path: "/admin/users", roles: ["administrator", "SUPER_ADMIN"] },
    { label: "Reports", path: "/admin/reports", roles: ["administrator", "admin", "SUPER_ADMIN", "MANAGER"] },
    { label: "Settings", path: "/admin/settings", roles: ["administrator", "SUPER_ADMIN"] },
  ];

  return (
    <div className="flex h-screen bg-[#0B0E11] text-white">
      {/* Sidebar - Dark Figma Theme */}
      <aside className="w-72 bg-[#151921] border-r border-gray-800 flex flex-col">
        <div className="p-8 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="text-indigo-500 text-2xl">⚡</div>
            <div className="text-2xl font-black tracking-tighter">RADAPOS</div>
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-4 font-bold">
            Logged in as
          </div>
          <div className="text-sm text-indigo-400 font-medium truncate">
            {user?.email}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-6 space-y-1">
          {NAV_ITEMS.filter((item) => item.roles.includes(userRole)).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`
              }
            >
              <span className="font-semibold text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section / Logout */}
        <div className="p-6 mt-auto border-t border-gray-800">
          <button
            onClick={() => {
              onLogout?.();
              navigate("/admin/login", { replace: true });
            }}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-gray-400 border border-gray-700 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
          >
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto bg-[#0B0E11] relative">
        {/* Optional Header for Breadcrumbs */}
        <header className="px-10 py-6 flex justify-between items-center sticky top-0 bg-[#0B0E11]/80 backdrop-blur-md z-10">
           <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Back to role selection
           </div>
        </header>

        <div className="px-10 pb-10">
           <Outlet />
        </div>
      </main>
    </div>
  );
}