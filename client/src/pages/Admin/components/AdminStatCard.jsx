import React from 'react';

const AdminStatCard = ({ label, value, trend }) => (
  <div className="admin-card p-4 border-l-4 border-l-rada-accent bg-gradient-to-br from-rada-surface to-rada-void">
    <div className="flex justify-between items-start">
      <span className="admin-field-label text-slate-400">{label}</span>
      {trend && <span className="text-[9px] font-mono text-rada-success">{trend}</span>}
    </div>
    <div className="text-4xl font-mono font-black text-white mt-2 tabular-nums tracking-tighter">
      {value}
    </div>
  </div>
);

export default AdminStatCard;