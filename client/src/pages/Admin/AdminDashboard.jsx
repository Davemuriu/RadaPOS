import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  Settings,
  LogOut,
  Search,
  FileBarChart,
  Filter,
  Zap,
  ShieldCheck,
} from "lucide-react";

import {
  NavItem,
  DashboardPanel,
  EventsTable,
  VendorsTable,
  StaffUsersTable,
  WithdrawalTable,
  SettingsPanel,
  CreateEventModal,
  CreateUserModal,
} from "./AdminShell.jsx";

const ROLE = {
  SUPER_ADMIN: "super_admin",
  EVENT_MANAGER: "event_manager",
  ACCOUNTANT: "accountant",
  VIEWER: "viewer",
};

const normalize = (v) => (v ?? "").toString().toLowerCase();

export default function AdminDashboard() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5555/api";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [events, setEvents] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});

  const [packages, setPackages] = useState([]);
  const [globalFees, setGlobalFees] = useState({});
  const [payoutSettings, setPayoutSettings] = useState({});

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const [eventForm, setEventForm] = useState({ name: "", location: "", duration: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", role: ROLE.VIEWER });

  const currentUser = {
    name: localStorage.getItem("userName") || "Admin",
    role: normalize(localStorage.getItem("userRole")),
  };

  const isSuperAdmin = currentUser.role === ROLE.SUPER_ADMIN;
  const isEventManager = currentUser.role === ROLE.EVENT_MANAGER;
  const isAccountant = currentUser.role === ROLE.ACCOUNTANT;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ev, wd, us, st, settings] = await Promise.all([
        axios.get(`${API_BASE}/events`),
        axios.get(`${API_BASE}/admin/withdrawals`),
        axios.get(`${API_BASE}/admin/users`),
        axios.get(`${API_BASE}/admin/stats`),
        axios.get(`${API_BASE}/admin/settings`),
      ]);

      setEvents(ev.data || []);
      setWithdrawals(wd.data || []);
      setUsers(us.data || []);
      setStats(st.data || {});
      setPackages(settings.data?.packages || []);
      setGlobalFees(settings.data?.globalFees || {});
      setPayoutSettings(settings.data?.payoutSettings || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const vendors = useMemo(
    () => users.filter((u) => normalize(u.role) === "vendor"),
    [users]
  );

  const staffUsers = useMemo(
    () => users.filter((u) => normalize(u.role) !== "vendor"),
    [users]
  );

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Zap size={24} />
          <span className="admin-brand-title">
            Rada<span>POS</span>
          </span>
        </div>

        <nav className="admin-nav">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <NavItem icon={<Calendar size={18} />} label="Events" active={activeTab === "events"} onClick={() => setActiveTab("events")} />
          <NavItem icon={<Users size={18} />} label="Vendors" active={activeTab === "vendors"} onClick={() => setActiveTab("vendors")} />
          <NavItem icon={<ShieldCheck size={18} />} label="Staff Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <NavItem icon={<Wallet size={18} />} label="Withdrawals" active={activeTab === "withdrawals"} onClick={() => setActiveTab("withdrawals")} />
          <NavItem icon={<FileBarChart size={18} />} label="Reports" active={activeTab === "reports"} onClick={() => setActiveTab("reports")} />
          <NavItem icon={<Settings size={18} />} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="admin-signout-wrap">
          <button className="admin-signout-btn" onClick={logout}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">{activeTab}</h1>

          <div className="admin-search-wrap">
            <Search size={16} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {activeTab === "dashboard" && (
          <DashboardPanel stats={stats} events={events} withdrawals={withdrawals} />
        )}

        {activeTab === "events" && (
          <EventsTable
            events={events}
            canCreate={isEventManager}
            onCreate={() => setEventModalOpen(true)}
          />
        )}

        {activeTab === "vendors" && (
          <VendorsTable vendors={vendors} packages={packages} />
        )}

        {activeTab === "users" && (
          <StaffUsersTable
            users={staffUsers}
            canCreate={isSuperAdmin}
            onCreate={() => setUserModalOpen(true)}
          />
        )}

        {activeTab === "withdrawals" && (
          <WithdrawalTable
            withdrawals={withdrawals}
            packages={packages}
            isSuperAdmin={isSuperAdmin}
            isAccountant={isAccountant}
          />
        )}

        {activeTab === "settings" && (
          <SettingsPanel
            packages={packages}
            globalFees={globalFees}
            payoutSettings={payoutSettings}
            isSuperAdmin={isSuperAdmin}
            isEventManager={isEventManager}
            isAccountant={isAccountant}
          />
        )}
      </main>

      <CreateEventModal
        open={eventModalOpen}
        value={eventForm}
        onChange={setEventForm}
        onClose={() => setEventModalOpen(false)}
      />

      <CreateUserModal
        open={userModalOpen}
        value={userForm}
        onChange={setUserForm}
        onClose={() => setUserModalOpen(false)}
      />
    </div>
  );
}
