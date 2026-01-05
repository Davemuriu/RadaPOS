import React from 'react';
import AdminShell from './components/AdminShell';
import AdminTable from './components/AdminTable';

const AdminEvents = () => (
  <AdminShell title="Session Manager">
    <div className="admin-filters flex justify-between bg-rada-surface p-4 border border-border-soft rounded-xl mb-4">
      <div className="flex gap-4">
        <button className="btn-admin-primary text-[10px]">START NEW SESSION</button>
        <button className="btn-admin-muted text-white text-[10px]">CLOSE ALL BATCHES</button>
      </div>
      <input className="admin-input max-w-[200px] py-2" placeholder="SCAN SESSION ID..." />
    </div>

    <AdminTable headers={['Session ID', 'Event Name', 'Terminal', 'Status', 'Load']}>
      <tr className="admin-row">
        <td className="admin-td font-mono text-rada-accent">#EV-202</td>
        <td className="admin-td font-black text-white">MAIN STAGE GALA</td>
        <td className="admin-td font-mono">TERM-01</td>
        <td className="admin-td"><span className="admin-pill-success">ACTIVE</span></td>
        <td className="admin-td">
           <div className="w-24 bg-rada-void h-2 rounded-full overflow-hidden">
              <div className="bg-rada-accent h-full w-[75%]"></div>
           </div>
        </td>
      </tr>
    </AdminTable>
  </AdminShell>
);

export default AdminEvents;