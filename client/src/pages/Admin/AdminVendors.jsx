import React from 'react';
import AdminShell from './components/AdminShell';
import AdminTable from './components/AdminTable';

const AdminVendors = () => {
  const headers = ['ID', 'Vendor Name', 'Category', 'Balance', 'Status', 'Quick Action'];

  return (
    <AdminShell title="POS Vendor Manager">
      {/* Search & Filter Bar - POS Density */}
      <div className="admin-filters flex items-center bg-rada-surface p-4 rounded-xl border border-border-soft mb-6">
        <input 
          className="admin-input flex-grow max-w-xs" 
          placeholder="SCAN OR TYPE VENDOR..." 
        />
        <div className="ml-auto flex gap-2">
          <button className="btn-admin-primary px-4 py-2">NEW VENDOR</button>
          <button className="btn-admin-muted px-4 py-2 text-white">BULK IMPORT</button>
        </div>
      </div>

      <AdminTable headers={headers}>
        <tr className="admin-row border-b border-border-soft/30 hover:bg-rada-void">
          <td className="admin-td font-mono text-rada-accent">#V-902</td>
          <td className="admin-td font-black text-white uppercase">Star Catering</td>
          <td className="admin-td italic text-xs">Food/Bev</td>
          <td className="admin-td font-mono">$1,250.00</td>
          <td className="admin-td">
            <span className="admin-pill-success">OPEN</span>
          </td>
          <td className="admin-td">
            <div className="flex gap-1">
              <button className="bg-rada-accent text-white p-2 rounded text-[10px] font-black">PAY</button>
              <button className="bg-slate-700 text-white p-2 rounded text-[10px] font-black">EDIT</button>
            </div>
          </td>
        </tr>
      </AdminTable>
    </AdminShell>
  );
};

export default AdminVendors;