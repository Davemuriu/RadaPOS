import React from 'react';
import AdminShell from './components/AdminShell';
import AdminTable from './components/AdminTable';

const AdminUsers = () => (
  <AdminShell title="Operator Directory">
    <AdminTable headers={['Op ID', 'Full Name', 'Access Level', 'Last Login', 'Action']}>
      <tr className="admin-row">
        <td className="admin-td font-mono text-rada-accent">004</td>
        <td className="admin-td text-white font-bold">ALEX RADA</td>
        <td className="admin-td italic text-xs uppercase tracking-widest text-slate-400">Manager (Lvl 4)</td>
        <td className="admin-td font-mono text-[10px]">2026-01-05 09:15</td>
        <td className="admin-td">
          <button className="bg-slate-700 hover:bg-rada-accent transition-colors p-2 px-4 rounded text-[10px] font-black text-white">RE-KEY</button>
        </td>
      </tr>
    </AdminTable>
  </AdminShell>
);

export default AdminUsers;