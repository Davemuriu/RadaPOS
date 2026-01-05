import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminShell({ user, onLogout }) {
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { label: "Dashboard", path: "/admin/dashboard", roles: ["SUPER_ADMIN", "MANAGER", "ACCOUNTANT"] },
    { label: "Events", path: "/admin/events", roles: ["SUPER_ADMIN", "MANAGER"] },
    { label: "Vendors", path: "/admin/vendors", roles: ["SUPER_ADMIN", "MANAGER"] },
    { label: "Admin Users", path: "/admin/users", roles: ["SUPER_ADMIN"] },
    { label: "Reports", path: "/admin/reports", roles: ["SUPER_ADMIN", "MANAGER", "ACCOUNTANT"] },
    { label: "Settings", path: "/admin/settings", roles: ["SUPER_ADMIN", "ACCOUNTANT"] },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="p-6 border-b border-border-soft">
          <div className="admin-brand-title">RADAPOS</div>
          <div className="text-xs text-slate-500 mt-2">
            {user?.email} • {user?.role}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {NAV_ITEMS.filter((item) => item.roles.includes(user?.role)).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "admin-nav-item-active" : "admin-nav-item-idle"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={() => {
              onLogout?.();
              navigate("/admin/login", { replace: true });
            }}
            className="admin-nav-item admin-nav-item-idle w-full"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
