import React, { useEffect, useState } from "react";
import {
  Download,
  Plus,
  X,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  UserPlus,
  Trash,
  Edit3,
  CreditCard,
  Percent,
} from "lucide-react";

const norm = (v) => (v ?? "").toString().trim().toLowerCase();

const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleString();
};

export const NavItem = ({ icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      active
        ? "bg-rada-accent/20 text-rada-accent border border-rada-accent/30 font-bold italic"
        : "text-slate-500 hover:bg-rada-surface/50 hover:text-slate-300 font-medium"
    }`}
  >
    {icon} {label}
  </button>
);

export const MetricCard = ({ title, value, color, trend }) => (
  <div className="bg-rada-surface border border-border-soft p-8 rounded-[32px] relative overflow-hidden transition-all hover:-translate-y-1 shadow-2xl">
    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color === "orange" ? "bg-rada-warning" : color === "emerald" ? "bg-rada-success" : "bg-rada-accent"}`} />
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 underline decoration-rada-accent/10">{title}</p>
    <h3 className="text-3xl font-black text-white tracking-tighter not-italic font-mono">{value}</h3>
    <p className={`text-[10px] font-bold italic mt-2 uppercase tracking-widest opacity-60 ${color === "orange" ? "text-rada-warning" : "text-rada-accent"}`}>{trend}</p>
  </div>
);

export const StatusPill = ({ status }) => (
  <span
    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter inline-flex items-center gap-2 border ${
      ["active", "approved", "open"].includes(norm(status))
        ? "bg-rada-success/10 text-rada-success border-rada-success/20"
        : "bg-rada-warning/10 text-rada-warning border-rada-warning/20"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${["active", "approved", "open"].includes(norm(status)) ? "bg-rada-success" : "bg-rada-warning"}`} />
    {status}
  </span>
);

export const DashboardPanel = ({
  stats,
  openEventsCount,
  pendingActivitiesCount,
  roleLabel,
  withdrawalsPreview,
  vendorAppsPreview,
  packages,
  isSuperAdmin,
  isEventManager,
  isAccountant,
  approvingId,
  onInitiateWithdrawal,
  onFinalApproveWithdrawal,
  onInitialApproveVendor,
  onFinalApproveVendor,
}) => (
  <div className="space-y-12 animate-in fade-in">
    <div className="grid grid-cols-6 gap-8">
      <MetricCard title="Gross Sales" value={`KES ${Number(stats?.total_revenue || 0).toLocaleString()}`} color="indigo" trend="Incoming" />
      <MetricCard title="Host Earning" value={`KES ${Number(stats?.platform_commission || 0).toLocaleString()}`} color="emerald" trend="Platform Cut" />
      <MetricCard title="Vendors" value={Number(stats?.total_vendors || 0)} color="indigo" trend="Active Partners" />
      <MetricCard title="Queue" value={Number(stats?.pending_withdrawals || 0)} color="orange" trend="Withdrawals" />
      <MetricCard title="Open Events" value={openEventsCount} color="indigo" trend="Live Infrastructure" />
      <MetricCard title="Pending Activities" value={pendingActivitiesCount} color="orange" trend={roleLabel} />
    </div>

    {(isSuperAdmin || isAccountant) && (
      <WithdrawalTable
        withdrawals={withdrawalsPreview}
        packages={packages}
        approvingId={approvingId}
        isSuperAdmin={isSuperAdmin}
        isAccountant={isAccountant}
        onInitiate={onInitiateWithdrawal}
        onFinalApprove={onFinalApproveWithdrawal}
      />
    )}

    {(isSuperAdmin || isEventManager) && (
      <VendorApplicationsTable
        applications={vendorAppsPreview}
        isEventManager={isEventManager}
        isSuperAdmin={isSuperAdmin}
        onInitialApprove={onInitialApproveVendor}
        onFinalApprove={onFinalApproveVendor}
      />
    )}
  </div>
);

export const EventsTable = ({ events, canCreate, onOpenCreate }) => (
  <div className="bg-rada-surface border border-border-soft rounded-rada overflow-hidden shadow-2xl">
    <div className="p-10 border-b border-border-soft flex justify-between items-center">
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Events</h2>

      <button
        type="button"
        onClick={canCreate ? onOpenCreate : undefined}
        disabled={!canCreate}
        className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg flex items-center gap-2 ${
          canCreate ? "bg-rada-accent text-white hover:opacity-90" : "bg-slate-700 text-slate-400 cursor-not-allowed"
        }`}
      >
        <Plus size={18} /> Add Event
      </button>
    </div>

    <table className="w-full text-left">
      <thead className="bg-rada-void text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] border-b border-border-soft">
        <tr>
          <th className="p-8">Event</th>
          <th className="p-8">Location</th>
          <th className="p-8">Duration</th>
          <th className="p-8">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-soft">
        {events.map((ev) => (
          <tr key={ev.id} className="hover:bg-rada-void/50 transition">
            <td className="p-8 text-white font-black flex items-center gap-2">
              <Zap size={14} className="text-rada-accent" /> {ev.name}
            </td>
            <td className="p-8 text-slate-500 flex items-center gap-2">
              <MapPin size={14} /> {ev.location || "-"}
            </td>
            <td className="p-8 text-slate-500 flex items-center gap-2">
              <Clock size={14} /> {ev.duration || "-"}
            </td>
            <td className="p-8 text-slate-400">{ev.status || "draft"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const VendorsTable = ({ vendors, packages }) => (
  <div className="bg-rada-surface border border-border-soft rounded-rada overflow-hidden shadow-2xl">
    <table className="w-full text-left font-bold italic">
      <thead className="bg-rada-void text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] border-b border-border-soft">
        <tr>
          <th className="p-8">Vendor</th>
          <th className="p-8">Tier</th>
          <th className="p-8">Total Revenue</th>
          <th className="p-8">Host Margin</th>
          <th className="p-8 text-right pr-12">Net</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border-soft">
        {vendors.map((v) => {
          const tier = packages.find((p) => p.name === v.tier) || { name: "Unassigned", percent: 0 };
          const gross = Number(v.total_collection || v.total_revenue || 0);
          const txFees = Number(v.total_tx_fees || 0);
          const hostMargin = gross * (Number(tier.percent || 0) / 100);
          const net = Math.max(0, gross - txFees - hostMargin);

          return (
            <tr key={v.id || v.username} className="hover:bg-rada-void/50 transition">
              <td className="p-8 text-white text-lg font-black">{v.username || v.name || "Vendor"}</td>
              <td className="p-8 text-slate-500 text-sm">{tier.name}</td>
              <td className="p-8 font-mono text-slate-300">KES {gross.toLocaleString()}</td>
              <td className="p-8 font-mono text-rada-warning/70">KES {hostMargin.toLocaleString()}</td>
              <td className="p-8 text-right pr-12 font-mono text-rada-success font-black">KES {net.toLocaleString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const StaffUsersTable = ({ users, canCreate, onOpenCreate }) => (
  <div className="bg-rada-surface border border-border-soft rounded-rada overflow-hidden shadow-2xl">
    <div className="p-10 border-b border-border-soft flex justify-between items-center">
      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Staff Users</h2>

      <button
        type="button"
        onClick={canCreate ? onOpenCreate : undefined}
        disabled={!canCreate}
        className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg flex items-center gap-2 ${
          canCreate ? "bg-rada-accent text-white hover:opacity-90" : "bg-slate-700 text-slate-400 cursor-not-allowed"
        }`}
      >
        <UserPlus size={18} /> New User
      </button>
    </div>

    <table className="w-full text-left">
      <thead className="bg-rada-void text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">
        <tr>
          <th className="p-8">Name</th>
          <th className="p-8">Role</th>
          <th className="p-8">Email</th>
          <th className="p-8">Phone</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-soft">
        {users.map((u) => (
          <tr key={u.id || u.email} className="hover:bg-rada-void/50 transition">
            <td className="p-8 text-white font-black flex items-center gap-2">
              <ShieldCheck size={16} className="text-rada-accent" /> {u.name || u.username || "User"}
            </td>
            <td className="p-8 text-slate-500">{u.role}</td>
            <td className="p-8 text-slate-500">{u.email || "-"}</td>
            <td className="p-8 text-slate-500">{u.phone || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const WithdrawalTable = ({
  withdrawals,
  packages,
  approvingId,
  isSuperAdmin,
  isAccountant,
  onInitiate,
  onFinalApprove,
}) => (
  <div className="bg-rada-surface border border-border-soft rounded-rada overflow-hidden shadow-2xl">
    <div className="p-8 border-b border-border-soft flex justify-between items-center italic">
      <h2 className="text-xl font-black text-white uppercase tracking-tight">Withdrawal Requests</h2>
    </div>

    <table className="w-full text-left font-bold italic">
      <thead className="bg-rada-void text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] border-b border-border-soft">
        <tr>
          <th className="p-6">Date Applied</th>
          <th className="p-6">Vendor</th>
          <th className="p-6">Amount</th>
          <th className="p-6">Vendor Balance</th>
          <th className="p-6">Available Balance</th>
          <th className="p-6 text-right pr-10">Action</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border-soft">
        {withdrawals?.length ? (
          withdrawals.map((req) => {
            const status = norm(req?.status || "pending");
            const showInitiate = isAccountant && status === "pending_accountant";
            const showApprove = isSuperAdmin && status === "pending_super_admin";

            const vendorName = req.vendor_name || req.vendor || req.username || "-";
            const dateApplied = req.date_applied || req.created_at || req.requested_at || req.createdAt;

            const amount = Number(req.amount || 0);

            const vendorTierName = req.vendor_tier || req.tier;
            const tier = packages?.find((p) => p.name === vendorTierName) || { percent: 0 };

            const vendorTotal =
              Number(req.vendor_balance ?? req.vendor_total ?? req.total_collection ?? req.total_revenue ?? 0);

            const hostMargin = vendorTotal * (Number(tier.percent || 0) / 100);
            const availableBalance = Math.max(0, vendorTotal - hostMargin);

            return (
              <tr key={req.id} className="hover:bg-rada-void/50 transition">
                <td className="p-6 text-slate-500 text-sm font-mono">{fmtDate(dateApplied)}</td>
                <td className="p-6 text-white text-sm font-black uppercase tracking-wide">{vendorName}</td>
                <td className="p-6 text-slate-300 font-mono">KES {amount.toLocaleString()}</td>
                <td className="p-6 text-slate-400 font-mono">KES {vendorTotal.toLocaleString()}</td>
                <td className="p-6 text-rada-success font-mono font-black">KES {availableBalance.toLocaleString()}</td>
                <td className="p-6 text-right pr-10">
                  {showInitiate && (
                    <button type="button" onClick={() => onInitiate(req.id)} className="bg-rada-warning px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg">
                      Initiate
                    </button>
                  )}

                  {showApprove && (
                    <button
                      type="button"
                      onClick={() => onFinalApprove(req.id)}
                      disabled={approvingId === req.id}
                      className="bg-rada-accent px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg disabled:opacity-60"
                    >
                      {approvingId === req.id ? "Processing..." : "Approve"}
                    </button>
                  )}

                  {!showInitiate && !showApprove && <StatusPill status={req.status || "pending"} />}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={6} className="p-10 text-center text-slate-600 text-xs uppercase font-bold tracking-widest opacity-30">
              No withdrawal requests found...
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export const VendorApplicationsTable = ({ applications, isEventManager, isSuperAdmin, onInitialApprove, onFinalApprove }) => (
  <div className="bg-rada-surface border border-border-soft rounded-rada overflow-hidden shadow-2xl">
    <div className="p-8 border-b border-border-soft flex justify-between items-center italic">
      <h2 className="text-xl font-black text-white uppercase tracking-tight">Vendor Applications</h2>
    </div>

    <table className="w-full text-left font-bold italic">
      <tbody className="divide-y divide-border-soft">
        {applications.length ? (
          applications.map((v) => {
            const status = norm(v?.application_status || "pending");
            const showInitial = isEventManager && status === "pending_event_manager";
            const showFinal = isSuperAdmin && status === "pending_super_admin";

            return (
              <tr key={v.id} className="hover:bg-rada-void/50 transition">
                <td className="p-8 text-white text-lg font-black uppercase">
                  {v.vendor_name || v.username || "Vendor"}
                  <p className="text-[10px] text-slate-500 uppercase mt-1">{v.phone || ""}</p>
                </td>
                <td className="p-8 text-right pr-12">
                  {showInitial && (
                    <button type="button" onClick={() => onInitialApprove(v.id)} className="bg-rada-warning px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg">
                      Initial Approve
                    </button>
                  )}
                  {showFinal && (
                    <button type="button" onClick={() => onFinalApprove(v.id)} className="bg-rada-accent px-5 py-2.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg">
                      Final Approve
                    </button>
                  )}
                  {!showInitial && !showFinal && <StatusPill status={v.application_status || "pending"} />}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td className="p-10 text-center text-slate-600 text-xs uppercase font-bold tracking-widest opacity-30">No pending applications...</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const ReportCard = ({ title, desc, onDownload }) => (
  <div className="bg-rada-surface border border-border-soft p-8 rounded-rada hover:border-rada-accent/40 transition-all flex flex-col h-full italic shadow-xl group">
    <div className="w-12 h-12 bg-rada-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Download className="text-rada-accent" size={24} />
    </div>
    <h3 className="text-white font-black uppercase italic mb-2 tracking-tighter text-lg">{title}</h3>
    <p className="text-slate-500 text-xs font-medium leading-relaxed mb-10 opacity-70 italic">{desc}</p>
    <button type="button" onClick={onDownload} className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rada-accent hover:text-white transition-colors underline decoration-rada-accent/20">
      <Download size={14} /> Generate Export
    </button>
  </div>
);

export const ReportsPanel = () => (
  <div className="grid md:grid-cols-3 gap-8 animate-in fade-in">
    <ReportCard title="Withdrawals Export" desc="Generate a CSV export of payout requests within the active scope." onDownload={() => alert("Connect export endpoint.")} />
    <ReportCard title="Events Summary" desc="Download event revenue, vendor count, and settlement totals." onDownload={() => alert("Connect export endpoint.")} />
    <ReportCard title="Vendor Performance" desc="Top vendors by revenue, margin, and settlement totals." onDownload={() => alert("Connect export endpoint.")} />
  </div>
);

export const SettingsPanel = ({
  packages,
  globalFees,
  payoutSettings,
  canEditTiers,
  canUpdateCharges,
  canEditPayoutModes,
  loading,
  onSave,
}) => {
  const [packagesLocal, setPackagesLocal] = useState(packages || []);
  const [feesLocal, setFeesLocal] = useState({ fixed: Number(globalFees?.fixed ?? 0), percentage: Number(globalFees?.percentage ?? 0) });
  const [payoutLocal, setPayoutLocal] = useState(
    payoutSettings || {
      mpesa_stk: { enabled: true, shortcode: "", passkey: "", callbackUrl: "" },
      bank_transfer: { enabled: false, bankName: "", accountName: "", accountNumber: "", swift: "" },
      paypal: { enabled: false, clientId: "", clientSecret: "", webhookUrl: "" },
      default_mode: "mpesa_stk",
    }
  );

  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [tierForm, setTierForm] = useState({ id: null, name: "", percent: 0, desc: "" });

  useEffect(() => setPackagesLocal(packages || []), [packages]);
  useEffect(() => setFeesLocal({ fixed: Number(globalFees?.fixed ?? 0), percentage: Number(globalFees?.percentage ?? 0) }), [globalFees]);
  useEffect(() => setPayoutLocal(payoutSettings || payoutLocal), [payoutSettings]);

  const openCreate = () => {
    setTierForm({ id: null, name: "", percent: 0, desc: "" });
    setTierModalOpen(true);
  };

  const openEdit = (p) => {
    setTierForm({ id: p.id, name: p.name || "", percent: Number(p.percent || 0), desc: p.desc || "" });
    setTierModalOpen(true);
  };

  const saveTierLocal = () => {
    const name = tierForm.name.trim();
    const percent = Number(tierForm.percent);
    const desc = tierForm.desc.trim();
    if (!name) return;
    if (Number.isNaN(percent) || percent < 0 || percent > 100) return;

    if (!tierForm.id) {
      const nextId = Math.max(0, ...packagesLocal.map((x) => Number(x.id) || 0)) + 1;
      setPackagesLocal([...packagesLocal, { id: nextId, name, percent, desc }]);
    } else {
      setPackagesLocal(packagesLocal.map((x) => (x.id === tierForm.id ? { ...x, name, percent, desc } : x)));
    }

    setTierModalOpen(false);
  };

  const deleteTierLocal = (id) => setPackagesLocal(packagesLocal.filter((x) => x.id !== id));

  const saveAll = async () => {
    await onSave(packagesLocal, feesLocal, payoutLocal);
  };

  return (
    <div className="space-y-12 animate-in fade-in max-w-6xl">
      <div className="bg-rada-surface border border-border-soft p-10 rounded-rada shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Percent size={24} className="text-rada-accent" /> Subscription Tiers
          </h2>

          <button
            type="button"
            onClick={openCreate}
            disabled={!canEditTiers}
            className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase shadow-lg ${canEditTiers ? "bg-rada-accent text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"}`}
          >
            <Plus size={16} className="inline mr-2" /> Add Tier
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packagesLocal.map((pkg) => (
            <div key={pkg.id} className="p-8 bg-rada-void border border-border-soft rounded-3xl relative group overflow-hidden transition-all hover:border-rada-accent/50">
              <div className="absolute top-0 right-0 p-6 font-black text-rada-accent text-4xl italic opacity-10 tracking-tighter">{Number(pkg.percent || 0)}%</div>
              <h3 className="text-white font-black text-xl mb-4 uppercase">{pkg.name}</h3>
              <p className="text-slate-500 text-xs italic mb-10 h-12 leading-relaxed">{pkg.desc}</p>

              <div className="flex justify-between items-center">
                <button type="button" onClick={() => openEdit(pkg)} disabled={!canEditTiers} className={`flex items-center gap-2 text-[10px] uppercase font-black ${canEditTiers ? "text-slate-500 hover:text-white" : "text-slate-700 cursor-not-allowed"}`}>
                  <Edit3 size={14} /> Edit
                </button>
                <button type="button" onClick={() => deleteTierLocal(pkg.id)} disabled={!canEditTiers} className={`${canEditTiers ? "text-rada-danger/30 hover:text-rada-danger" : "text-slate-700 cursor-not-allowed"}`}>
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {tierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-rada-surface border border-border-soft w-full max-w-lg rounded-rada p-12 shadow-2xl relative italic">
              <button type="button" onClick={() => setTierModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white">
                <X size={24} />
              </button>

              <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase mb-8 underline decoration-rada-accent/30 underline-offset-8">
                {tierForm.id ? "Edit Tier" : "Add Tier"}
              </h2>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveTierLocal();
                }}
              >
                <input className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" placeholder="Tier Name" value={tierForm.name} onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })} required />
                <input type="number" min="0" max="100" className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" placeholder="Percent" value={tierForm.percent} onChange={(e) => setTierForm({ ...tierForm, percent: Number(e.target.value) })} required />
                <input className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" placeholder="Description" value={tierForm.desc} onChange={(e) => setTierForm({ ...tierForm, desc: e.target.value })} />
                <button type="submit" className="w-full py-5 bg-rada-accent text-white font-black rounded-2xl shadow-lg shadow-rada-accent/20 uppercase tracking-widest text-xs mt-4">
                  Save Tier
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="bg-rada-surface border border-border-soft p-10 rounded-rada shadow-2xl">
        <h2 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3 tracking-tighter">
          <CreditCard size={24} className="text-rada-success" /> Transaction Charges
        </h2>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Fixed Service Fee (KES)</label>
            <input
              type="number"
              disabled={!canUpdateCharges}
              value={feesLocal.fixed}
              onChange={(e) => setFeesLocal({ ...feesLocal, fixed: Number(e.target.value) })}
              className={`w-full bg-rada-void border border-border-soft rounded-xl p-5 text-white font-bold outline-none ${!canUpdateCharges ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Gateway Charge Override (%)</label>
            <input
              type="number"
              disabled={!canUpdateCharges}
              value={feesLocal.percentage}
              onChange={(e) => setFeesLocal({ ...feesLocal, percentage: Number(e.target.value) })}
              className={`w-full bg-rada-void border border-border-soft rounded-xl p-5 text-white font-bold outline-none ${!canUpdateCharges ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>
      </div>

      <div className="bg-rada-surface border border-border-soft p-10 rounded-rada shadow-2xl">
        <h2 className="text-xl font-black text-white uppercase mb-8 tracking-tighter">Withdrawal Mode Integrations</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-rada-void border border-border-soft rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-black uppercase text-sm">M-Pesa STK</div>
              <input type="checkbox" checked={!!payoutLocal.mpesa_stk?.enabled} disabled={!canEditPayoutModes} onChange={(e) => setPayoutLocal({ ...payoutLocal, mpesa_stk: { ...payoutLocal.mpesa_stk, enabled: e.target.checked } })} />
            </div>
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Shortcode" disabled={!canEditPayoutModes} value={payoutLocal.mpesa_stk?.shortcode || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, mpesa_stk: { ...payoutLocal.mpesa_stk, shortcode: e.target.value } })} />
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Passkey" disabled={!canEditPayoutModes} value={payoutLocal.mpesa_stk?.passkey || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, mpesa_stk: { ...payoutLocal.mpesa_stk, passkey: e.target.value } })} />
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Callback URL" disabled={!canEditPayoutModes} value={payoutLocal.mpesa_stk?.callbackUrl || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, mpesa_stk: { ...payoutLocal.mpesa_stk, callbackUrl: e.target.value } })} />
          </div>

          <div className="bg-rada-void border border-border-soft rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-black uppercase text-sm">Bank Transfer</div>
              <input type="checkbox" checked={!!payoutLocal.bank_transfer?.enabled} disabled={!canEditPayoutModes} onChange={(e) => setPayoutLocal({ ...payoutLocal, bank_transfer: { ...payoutLocal.bank_transfer, enabled: e.target.checked } })} />
            </div>
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Bank Name" disabled={!canEditPayoutModes} value={payoutLocal.bank_transfer?.bankName || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, bank_transfer: { ...payoutLocal.bank_transfer, bankName: e.target.value } })} />
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Account Name" disabled={!canEditPayoutModes} value={payoutLocal.bank_transfer?.accountName || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, bank_transfer: { ...payoutLocal.bank_transfer, accountName: e.target.value } })} />
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Account Number" disabled={!canEditPayoutModes} value={payoutLocal.bank_transfer?.accountNumber || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, bank_transfer: { ...payoutLocal.bank_transfer, accountNumber: e.target.value } })} />
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="SWIFT (optional)" disabled={!canEditPayoutModes} value={payoutLocal.bank_transfer?.swift || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, bank_transfer: { ...payoutLocal.bank_transfer, swift: e.target.value } })} />
          </div>

          <div className="bg-rada-void border border-border-soft rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-white font-black uppercase text-sm">PayPal</div>
              <input type="checkbox" checked={!!payoutLocal.paypal?.enabled} disabled={!canEditPayoutModes} onChange={(e) => setPayoutLocal({ ...payoutLocal, paypal: { ...payoutLocal.paypal, enabled: e.target.checked } })} />
            </div>
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Client ID" disabled={!canEditPayoutModes} value={payoutLocal.paypal?.clientId || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, paypal: { ...payoutLocal.paypal, clientId: e.target.value } })} />
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Client Secret" disabled={!canEditPayoutModes} value={payoutLocal.paypal?.clientSecret || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, paypal: { ...payoutLocal.paypal, clientSecret: e.target.value } })} />
            <input className="w-full bg-black/20 border border-border-soft rounded-xl p-3 text-white text-sm outline-none" placeholder="Webhook URL" disabled={!canEditPayoutModes} value={payoutLocal.paypal?.webhookUrl || ""} onChange={(e) => setPayoutLocal({ ...payoutLocal, paypal: { ...payoutLocal.paypal, webhookUrl: e.target.value } })} />
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Default Withdrawal Mode</label>
            <select
              disabled={!canEditPayoutModes}
              value={payoutLocal.default_mode || "mpesa_stk"}
              onChange={(e) => setPayoutLocal({ ...payoutLocal, default_mode: e.target.value })}
              className={`w-full bg-rada-void border border-border-soft rounded-xl p-4 text-white font-bold outline-none ${!canEditPayoutModes ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="mpesa_stk">M-Pesa STK</option>
              <option value="bank_transfer">Direct Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={saveAll} disabled={loading || (!canEditTiers && !canUpdateCharges && !canEditPayoutModes)} className="bg-rada-accent px-7 py-3 rounded-2xl text-[11px] font-black uppercase text-white shadow-lg disabled:opacity-50">
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {!canEditPayoutModes && <div className="mt-4 text-slate-500 text-xs">Only Super Admin can configure payout integrations.</div>}
      </div>
    </div>
  );
};

export const CreateEventModal = ({ isOpen, loading, value, onChange, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-rada-surface border border-border-soft w-full max-w-lg rounded-rada p-12 shadow-2xl relative italic">
        <button type="button" onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase mb-8 underline decoration-rada-accent/30 underline-offset-8">
          Add Event
        </h2>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" placeholder="Event Name" required value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
          <input className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" placeholder="Location" required value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} />
          <input className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" placeholder="Duration" required value={value.duration} onChange={(e) => onChange({ ...value, duration: e.target.value })} />

          <button type="submit" disabled={loading} className="w-full py-5 bg-rada-accent text-white font-black rounded-2xl shadow-lg shadow-rada-accent/20 uppercase tracking-widest text-xs mt-4 disabled:opacity-60">
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export const CreateUserModal = ({ isOpen, loading, value, onChange, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-rada-surface border border-border-soft w-full max-w-lg rounded-rada p-12 shadow-2xl relative italic">
        <button type="button" onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase mb-8 underline decoration-rada-accent/30 underline-offset-8">
          Create Staff User
        </h2>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Full Name</label>
            <input className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" required value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Email</label>
            <input type="email" className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" required value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Phone</label>
            <input className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" required value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Role</label>
            <select className="w-full bg-rada-void border border-border-soft rounded-2xl p-5 outline-none font-bold text-white shadow-inner" value={value.role} onChange={(e) => onChange({ ...value, role: e.target.value })}>
              <option value="super_admin">Super Admin</option>
              <option value="event_manager">Event Manager</option>
              <option value="accountant">Accountant</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-rada-accent text-white font-black rounded-2xl shadow-lg shadow-rada-accent/20 uppercase tracking-widest text-xs mt-4 disabled:opacity-60">
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};
