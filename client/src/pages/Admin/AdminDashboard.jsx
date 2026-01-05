import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (!token || !stored) {
      navigate("/admin/login");
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      navigate("/admin/login");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-rada-void text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome {user?.name || "Admin"}{" "}
              <span className="text-slate-500">
                ({user?.admin_role || "admin"})
              </span>
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-border-soft px-4 py-2 text-sm hover:bg-white/5"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Revenue (Commission)" value="—" hint="Coming next" />
          <Card title="Vendors Pending Approval" value="—" hint="Coming next" />
          <Card title="Payouts Pending Approval" value="—" hint="Coming next" />
        </div>

        <div className="mt-10 rounded-2xl bg-rada-surface border border-border-soft p-6">
          <h2 className="text-lg font-semibold">Next steps</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc list-inside">
            <li>Protect routes by role/admin_role (RBAC)</li>
            <li>Create admin users (Administrator only)</li>
            <li>Approval workflows (vendors, packages, payouts)</li>
            <li>Audit trail viewer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, hint }) {
  return (
    <div className="rounded-2xl bg-rada-surface border border-border-soft p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs text-slate-500 mt-2">{hint}</p>
    </div>
  );
}
