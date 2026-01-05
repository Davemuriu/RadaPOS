import React from "react";

function StatCard({ label, value, trend }) {
  return (
    <div className="admin-card p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
      {trend ? (
        <div className="mt-2 text-[11px] font-black text-rada-success tracking-[0.2em]">
          {trend}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="admin-title mb-8">Terminal Overview</h1>

      {/* POS Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Net Sales" value="$14,250.00" trend="LIVE" />
        <StatCard label="Transactions" value="842" />
        <StatCard label="Avg Ticket" value="$16.92" />
        <StatCard label="Active Terminals" value="06" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 admin-card p-6">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black mb-4">
            Live Transaction Stream
          </h3>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex justify-between p-2 bg-rada-void/50 border-l-2 border-rada-success">
              <span className="text-white">#TRX-9921 - Completed</span>
              <span className="text-rada-success">+$45.00</span>
            </div>

            <div className="flex justify-between p-2 bg-rada-void/50 border-l-2 border-rada-warning">
              <span className="text-white">#TRX-9920 - Refunded</span>
              <span className="text-rada-danger">-$12.50</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card p-6 space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black mb-4">
            System Actions
          </h3>

          <button className="btn-admin-primary w-full text-left py-4 px-6 flex justify-between">
            <span>OPEN DRAWER</span> <span>F1</span>
          </button>

          <button className="btn-admin-primary w-full text-left py-4 px-6 flex justify-between opacity-90">
            <span>PRINT X-REPORT</span> <span>F2</span>
          </button>
        </div>
      </div>
    </div>
  );
}
