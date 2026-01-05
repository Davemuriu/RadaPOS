import React from 'react';
import AdminShell from './components/AdminShell';
import AdminStatCard from './components/AdminStatCard';

const AdminDashboard = () => (
  <AdminShell title="Terminal Overview">
    {/* POS Stats: Focus on Currency and Frequency */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <AdminStatCard label="Net Sales" value="$14,250.00" trend="LIVE" />
      <AdminStatCard label="Transactions" value="842" />
      <AdminStatCard label="Avg Ticket" value="$16.92" />
      <AdminStatCard label="Active Terminals" value="06" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Feed - POS Style */}
      <div className="lg:col-span-2 admin-card p-6">
        <h3 className="admin-field-label mb-4">Live Transaction Stream</h3>
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

      {/* Quick Actions Panel */}
      <div className="admin-card p-6 space-y-3">
        <h3 className="admin-field-label mb-4">System Actions</h3>
        <button className="btn-admin-primary w-full text-left py-4 px-6 flex justify-between">
          <span>OPEN DRAWER</span> <span>F1</span>
        </button>
        <button className="btn-admin-warning w-full text-left py-4 px-6 flex justify-between">
          <span>PRINT X-REPORT</span> <span>F2</span>
        </button>
      </div>
    </div>
  </AdminShell>
);

export default AdminDashboard;