import React from 'react';
import AdminShell from './components/AdminShell';
import AdminStatCard from './components/AdminStatCard';

const AdminDashboard = () => (
  <AdminShell title="Admin Overview">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <AdminStatCard label="Live Events" value="12" />
      <AdminStatCard label="Total Users" value="1,240" />
      <AdminStatCard label="Revenue" value="$12.4K" />
    </div>
    <div className="admin-card p-10 h-64 flex items-center justify-center">
      <span className="text-slate-500 italic uppercase font-black tracking-widest">Analytics Graph Placeholder</span>
    </div>
  </AdminShell>
);

export default AdminDashboard;