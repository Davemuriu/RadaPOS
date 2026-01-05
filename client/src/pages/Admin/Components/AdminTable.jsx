import React from 'react';

const AdminTable = ({ headers, children }) => (
  <div className="admin-card border border-border-soft overflow-hidden shadow-inner">
    <div className="bg-rada-void/80 px-4 py-2 border-b border-border-soft flex justify-between">
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Ledger View</span>
       <span className="text-[10px] font-mono text-rada-accent animate-pulse">● SYNCED</span>
    </div>
    <table className="admin-table">
      <thead className="admin-thead bg-rada-surface">
        <tr>
          {headers.map((h) => (
            <th key={h} className="admin-th py-4 px-4 text-[10px]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-soft/20">
        {children}
      </tbody>
    </table>
  </div>
);

export default AdminTable;