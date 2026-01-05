import React from 'react';
import AdminShell from './components/AdminShell';
import AdminStatCard from './components/AdminStatCard';

const AdminReports = () => {
  return (
    <AdminShell title="System Reports">
      {/* High Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <AdminStatCard label="Monthly Growth" value="+24.8%" />
        <AdminStatCard label="Payouts Pending" value="$3,200" />
      </div>

      <div className="space-y-4">
        <h3 className="admin-field-label ml-2">Available Downloads</h3>
        
        {/* Report Download Cards */}
        <div className="admin-card p-8 flex items-center justify-between group hover:border-rada-accent/50 transition-colors">
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl">Financial Summary</h4>
            <p className="text-xs text-slate-500 italic mt-1">Full breakdown of ticket sales, vendor fees, and tax.</p>
          </div>
          <button className="btn-admin-primary">Generate PDF</button>
        </div>

        <div className="admin-card p-8 flex items-center justify-between group hover:border-rada-accent/50 transition-colors">
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl">User Activity Log</h4>
            <p className="text-xs text-slate-500 italic mt-1">Export all login attempts and administrative actions.</p>
          </div>
          <button className="btn-admin-warning">Export CSV</button>
        </div>

        <div className="admin-card p-8 flex items-center justify-between group hover:border-rada-accent/50 transition-colors">
          <div>
            <h4 className="text-white font-black uppercase tracking-tighter text-xl">Vendor Performance</h4>
            <p className="text-xs text-slate-500 italic mt-1">Rankings based on user feedback and event success rate.</p>
          </div>
          <button className="btn-admin-primary">Generate PDF</button>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminReports;