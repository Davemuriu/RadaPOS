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
  VendorApplicationsTable,
  SettingsPanel,
  ReportsPanel,
  CreateEventModal,
  CreateUserModal,
} from "./AdminDashboard.components";

const ROLE = {
  SUPER_ADMIN: "super_admin",
  EVENT_MANAGER: "event_manager",
  ACCOUNTANT: "accountant",
  VIEWER: "viewer",
};

const norm = (v) => (v ?? "").toString().trim().toLowerCase();

export default function AdminDashboard() {
  const navigate = useNavigate();
  const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5555/api";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const [bannerError, setBannerError] = useState("");
  const [bannerSuccess, setBannerSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ dateRange: "all", startDate: "", endDate: "", eventId: "all" });

  const [events, setEvents] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [platformUsers, setPlatformUsers] = useState([]);
  const [vendorApps, setVendorApps] = useState([]);

  const [stats, setStats] = useState({
    total_revenue: 0,
    platform_commission: 0,
    total_vendors: 0,
    pending_withdrawals: 0,
  });

  const [packages, setPackages] = useState([
    { id: 1, name: "Basic", percent: 15, desc: "Entry level vendors" },
    { id: 2, name: "Standard", percent: 10, desc: "High volume merchants" },
    { id: 3, name: "Premium", percent: 5, desc: "Strategic partners" },
  ]);

  const [globalFees, setGlobalFees] = useState({ fixed: 15, percentage: 1.5 });

  const [payoutSettings, setPayoutSettings] = useState({
    mpesa_stk: { enabled: true, shortcode: "", passkey: "", callbackUrl: "" },
    bank_transfer: { enabled: false, bankName: "", accountName: "", accountNumber: "", swift: "" },
    paypal: { enabled: false, clientId: "", clientSecret: "", webhookUrl: "" },
    default_mode: "mpesa_stk",
  });

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ name: "", location: "", duration: "" });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", role: ROLE.VIEWER });

  const currentUser = useMemo(() => {
    return {
      name: localStorage.getItem("userName") || "Admin Operator",
      role: norm(localStorage.getItem("userRole")) || ROLE.VIEWER,
    };
  }, []);

  const isSuperAdmin = currentUser.role === ROLE.SUPER_ADMIN;
  const isEventManager = currentUser.role === ROLE.EVENT_MANAGER;
  const isAccountant = currentUser.role === ROLE.ACCOUNTANT;

  const canCreateStaffUsers = isSuperAdmin;
  const canCreateEvents = isEventManager;
  const canEditTiers = isEventManager;
  const canUpdateCharges = isAccountant;
  const canEditPayoutModes = isSuperAdmin;

  const resetBanners = () => {
    setBannerError("");
    setBannerSuccess("");
  };

  const computedParams = useMemo(() => {
    const p = {};
    if (filters.eventId !== "all") p.eventId = filters.eventId;
    if (filters.dateRange === "week") p.range = "week";
    if (filters.dateRange === "custom") {
      if (filters.startDate) p.startDate = filters.startDate;
      if (filters.endDate) p.endDate = filters.endDate;
    }
    return p;
  }, [filters]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/settings`);
      if (res?.data?.packages) setPackages(res.data.packages);
      if (res?.data?.globalFees) setGlobalFees(res.data.globalFees);
      if (res?.data?.payoutSettings) setPayoutSettings(res.data.payoutSettings);
    } catch {
      return;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    resetBanners();
    try {
      const [evRes, withRes, statsRes, userRes, appsRes] = await Promise.all([
        axios.get(`${API_BASE}/events`, { params: computedParams }),
        axios.get(`${API_BASE}/admin/withdrawals`, { params: computedParams }),
        axios.get(`${API_BASE}/admin/stats`, { params: computedParams }),
        axios.get(`${API_BASE}/admin/users`),
        axios.get(`${API_BASE}/admin/vendor-applications`, { params: computedParams }),
      ]);

      setEvents(Array.isArray(evRes.data) ? evRes.data : []);
      setWithdrawals(Array.isArray(withRes.data) ? withRes.data : []);
      setStats(statsRes.data || { total_revenue: 0, platform_commission: 0, total_vendors: 0, pending_withdrawals: 0 });
      setPlatformUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setVendorApps(Array.isArray(appsRes.data) ? appsRes.data : []);
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed to sync data. Check API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchData();
  }, [computedParams.eventId, computedParams.range, computedParams.startDate, computedParams.endDate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const openEventsCount = useMemo(() => events.filter((e) => norm(e?.status) === "open").length, [events]);

  const pendingActivitiesCount = useMemo(() => {
    if (isSuperAdmin) {
      const pw = withdrawals.filter((w) => norm(w?.status) === "pending_super_admin").length;
      const pv = vendorApps.filter((v) => norm(v?.application_status) === "pending_super_admin").length;
      const pe = events.filter((e) => norm(e?.status) === "pending_super_admin").length;
      return pw + pv + pe;
    }
    if (isEventManager) {
      const pv = vendorApps.filter((v) => norm(v?.application_status) === "pending_event_manager").length;
      const pe = events.filter((e) => ["draft", "pending_event_manager"].includes(norm(e?.status))).length;
      return pv + pe;
    }
    if (isAccountant) {
      return withdrawals.filter((w) => norm(w?.status) === "pending_accountant").length;
    }
    return 0;
  }, [isSuperAdmin, isEventManager, isAccountant, withdrawals, vendorApps, events]);

  const staffUsers = useMemo(() => {
    const set = new Set([ROLE.SUPER_ADMIN, ROLE.EVENT_MANAGER, ROLE.ACCOUNTANT, ROLE.VIEWER]);
    return platformUsers.filter((u) => set.has(norm(u?.role)));
  }, [platformUsers]);

  const filteredStaffUsers = useMemo(() => {
    const t = norm(searchTerm);
    if (!t) return staffUsers;
    return staffUsers.filter((u) => {
      const name = norm(u?.name || u?.username);
      const email = norm(u?.email);
      const phone = norm(u?.phone);
      const role = norm(u?.role);
      return name.includes(t) || email.includes(t) || phone.includes(t) || role.includes(t);
    });
  }, [staffUsers, searchTerm]);

  const filteredVendors = useMemo(() => {
    const t = norm(searchTerm);
    return platformUsers.filter((u) => norm(u?.role) === "vendor" && norm(u?.username || u?.name).includes(t));
  }, [platformUsers, searchTerm]);

  const filteredWithdrawals = useMemo(() => {
    const t = norm(searchTerm);
    if (!t) return withdrawals;
    return withdrawals.filter((w) => {
      const vendor = norm(w?.vendor_name);
      const status = norm(w?.status);
      const amount = norm(w?.amount);
      return vendor.includes(t) || status.includes(t) || amount.includes(t);
    });
  }, [withdrawals, searchTerm]);

  const filteredVendorApps = useMemo(() => {
    const t = norm(searchTerm);
    if (!t) return vendorApps;
    return vendorApps.filter((v) => {
      const name = norm(v?.vendor_name || v?.username);
      const status = norm(v?.application_status);
      const phone = norm(v?.phone);
      return name.includes(t) || status.includes(t) || phone.includes(t);
    });
  }, [vendorApps, searchTerm]);

  const createEvent = async () => {
    if (!canCreateEvents) return;
    resetBanners();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/events`, {
        name: eventForm.name.trim(),
        location: eventForm.location.trim(),
        duration: eventForm.duration.trim(),
      });
      setBannerSuccess("Event created.");
      setIsEventModalOpen(false);
      setEventForm({ name: "", location: "", duration: "" });
      fetchData();
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  const approveVendorInitial = async (vendorId) => {
    if (!isEventManager) return;
    resetBanners();
    try {
      await axios.post(`${API_BASE}/event-manager/vendors/${vendorId}/initial-approve`);
      setBannerSuccess("Vendor sent to Super Admin for final approval.");
      fetchData();
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed initial approval.");
    }
  };

  const approveVendorFinal = async (vendorId) => {
    if (!isSuperAdmin) return;
    if (!window.confirm("Final approve this vendor?")) return;
    resetBanners();
    try {
      await axios.post(`${API_BASE}/admin/vendors/${vendorId}/final-approve`);
      setBannerSuccess("Vendor approved.");
      fetchData();
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed vendor approval.");
    }
  };

  const initiateWithdrawal = async (id) => {
    if (!isAccountant) return;
    resetBanners();
    try {
      await axios.post(`${API_BASE}/accountant/withdrawals/${id}/initiate`);
      setBannerSuccess("Withdrawal initiated for Super Admin approval.");
      fetchData();
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed to initiate withdrawal.");
    }
  };

  const approveWithdrawalFinal = async (id) => {
    if (!isSuperAdmin) return;
    if (!window.confirm("Approve payout?")) return;
    resetBanners();
    setApprovingId(id);
    try {
      await axios.post(`${API_BASE}/admin/withdrawals/${id}/approve`);
      setBannerSuccess("Withdrawal approved.");
      fetchData();
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed approval.");
    } finally {
      setApprovingId(null);
    }
  };

  const createStaffUser = async () => {
    if (!canCreateStaffUsers) return;
    resetBanners();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/admin/users`, {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: userForm.phone.trim(),
        role: userForm.role,
      });
      setBannerSuccess("Staff user created.");
      setIsUserModalOpen(false);
      setUserForm({ name: "", email: "", phone: "", role: ROLE.VIEWER });
      fetchData();
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed to create staff user.");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (nextPackages, nextFees, nextPayout) => {
    resetBanners();
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/admin/settings`, {
        packages: nextPackages,
        globalFees: nextFees,
        payoutSettings: nextPayout,
      });

      setPackages(nextPackages);
      setGlobalFees(nextFees);
      setPayoutSettings(nextPayout);

      setBannerSuccess("Settings saved.");
    } catch (e) {
      setBannerError(e?.response?.data?.message || "Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-rada-void text-slate-200 overflow-hidden font-sans italic font-medium">
      <aside className="w-72 bg-rada-surface border-r border-border-soft flex flex-col h-full shadow-2xl shrink-0">
        <div className="p-10 flex items-center gap-3">
          <Zap className="text-rada-accent fill-rada-accent animate-pulse" size={24} />
          <span className="text-2xl font-black tracking-tighter text-white uppercase not-italic">
            Rada<span className="text-rada-success">POS</span>
          </span>
        </div>

        <nav className="px-6 space-y-2 flex-grow overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <NavItem icon={<Calendar size={18} />} label="Events" active={activeTab === "events"} onClick={() => setActiveTab("events")} />
          <NavItem icon={<Users size={18} />} label="Vendors" active={activeTab === "vendors"} onClick={() => setActiveTab("vendors")} />
          <NavItem icon={<ShieldCheck size={18} />} label="Staff Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <NavItem icon={<Wallet size={18} />} label="Withdrawals" active={activeTab === "withdrawals"} onClick={() => setActiveTab("withdrawals")} />
          <NavItem icon={<FileBarChart size={18} />} label="Reports" active={activeTab === "reports"} onClick={() => setActiveTab("reports")} />
          <NavItem icon={<Settings size={18} />} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="p-6 border-t border-border-soft bg-rada-surface mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 rounded-xl text-rada-danger hover:bg-rada-danger/10 transition-all font-black uppercase text-xs tracking-widest">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-grow p-12 overflow-y-auto h-full scrollbar-hide">
        <header className="flex justify-between items-center mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter underline decoration-rada-accent/30 underline-offset-8 uppercase">{activeTab}</h1>
            <div className="flex items-center gap-3">
              {loading && <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Syncing...</span>}
              {bannerError && <span className="text-[10px] uppercase tracking-[0.2em] text-rada-danger font-black">{bannerError}</span>}
              {bannerSuccess && <span className="text-[10px] uppercase tracking-[0.2em] text-rada-success font-black">{bannerSuccess}</span>}
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-rada-surface border border-border-soft rounded-xl py-2 pl-12 pr-4 text-xs font-bold outline-none italic w-64 focus:ring-1 focus:ring-rada-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-10 p-6 bg-rada-surface border border-border-soft rounded-2xl items-center shadow-xl">
          <div className="flex items-center gap-2 text-rada-accent font-black text-[10px] uppercase italic mr-4 tracking-widest">
            <Filter size={14} /> Scope Logic
          </div>

          <select value={filters.eventId} onChange={(e) => setFilters({ ...filters, eventId: e.target.value })} className="bg-rada-void border border-border-soft rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer">
            <option value="all">Global (All Events)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>

          <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })} className="bg-rada-void border border-border-soft rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer">
            <option value="all">Lifetime</option>
            <option value="week">This Week</option>
            <option value="custom">Custom Range</option>
          </select>

          {filters.dateRange === "custom" && (
            <div className="flex gap-3">
              <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="bg-rada-void border border-border-soft rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer" />
              <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="bg-rada-void border border-border-soft rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer" />
            </div>
          )}
        </div>

        {activeTab === "dashboard" && (
          <DashboardPanel
            stats={stats}
            openEventsCount={openEventsCount}
            pendingActivitiesCount={pendingActivitiesCount}
            roleLabel={isSuperAdmin ? "Final Approval" : isEventManager ? "Initial Review" : isAccountant ? "Initiation" : "View"}
            withdrawalsPreview={filteredWithdrawals.slice(0, 6)}
            vendorAppsPreview={filteredVendorApps.slice(0, 6)}
            packages={packages}
            isSuperAdmin={isSuperAdmin}
            isEventManager={isEventManager}
            isAccountant={isAccountant}
            approvingId={approvingId}
            onInitiateWithdrawal={initiateWithdrawal}
            onFinalApproveWithdrawal={approveWithdrawalFinal}
            onInitialApproveVendor={approveVendorInitial}
            onFinalApproveVendor={approveVendorFinal}
          />
        )}

        {activeTab === "events" && (
          <EventsTable
            events={events}
            canCreate={canCreateEvents}
            onOpenCreate={() => setIsEventModalOpen(true)}
          />
        )}

        {activeTab === "vendors" && <VendorsTable vendors={filteredVendors} packages={packages} />}

        {activeTab === "users" && (
          <StaffUsersTable users={filteredStaffUsers} canCreate={canCreateStaffUsers} onOpenCreate={() => setIsUserModalOpen(true)} />
        )}

        {activeTab === "withdrawals" && (
          <WithdrawalTable
            withdrawals={filteredWithdrawals}
            packages={packages}
            approvingId={approvingId}
            isSuperAdmin={isSuperAdmin}
            isAccountant={isAccountant}
            onInitiate={initiateWithdrawal}
            onFinalApprove={approveWithdrawalFinal}
          />
        )}

        {activeTab === "reports" && <ReportsPanel />}

        {activeTab === "settings" && (
          <SettingsPanel
            packages={packages}
            globalFees={globalFees}
            payoutSettings={payoutSettings}
            canEditTiers={canEditTiers}
            canUpdateCharges={canUpdateCharges}
            canEditPayoutModes={canEditPayoutModes}
            loading={loading}
            onSave={saveSettings}
          />
        )}

        {activeTab === "approvals" && (
          <div className="space-y-8">
            <VendorApplicationsTable
              applications={filteredVendorApps}
              isEventManager={isEventManager}
              isSuperAdmin={isSuperAdmin}
              onInitialApprove={approveVendorInitial}
              onFinalApprove={approveVendorFinal}
            />

            <WithdrawalTable
              withdrawals={filteredWithdrawals}
              packages={packages}
              approvingId={approvingId}
              isSuperAdmin={isSuperAdmin}
              isAccountant={isAccountant}
              onInitiate={initiateWithdrawal}
              onFinalApprove={approveWithdrawalFinal}
            />
          </div>
        )}
      </main>

      <CreateEventModal
        isOpen={isEventModalOpen}
        loading={loading}
        value={eventForm}
        onChange={setEventForm}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={createEvent}
      />

      <CreateUserModal
        isOpen={isUserModalOpen}
        loading={loading}
        value={userForm}
        onChange={setUserForm}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={createStaffUser}
      />
    </div>
  );
}
