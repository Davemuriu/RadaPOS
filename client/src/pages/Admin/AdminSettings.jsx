import React from 'react';
import AdminShell from './AdminShell';

const AdminSettings = () => (
  <AdminShell title="Terminal Configuration">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
      <div className="admin-card p-8 space-y-6">
        <h3 className="admin-field-label">Hardware Parameters</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Printer Thermal Width</label>
            <select className="admin-select w-full mt-1">
              <option>80mm (Standard)</option>
              <option>58mm (Compact)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold">Drawer Pulse Duration</label>
            <input className="admin-input mt-1" defaultValue="250ms" />
          </div>
        </div>
      </div>

      <div className="admin-card p-8 space-y-6">
        <h3 className="admin-field-label">Security Protocol</h3>
        <div className="space-y-4">
           <div className="flex items-center justify-between p-4 bg-rada-void rounded border border-border-soft">
              <span className="text-xs text-white uppercase font-bold">Auto-Lock (5min)</span>
              <div className="w-10 h-5 bg-rada-accent rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
           </div>
           <button className="btn-admin-warning w-full py-4 uppercase text-xs">Purge Local Cache</button>
        </div>
      </div>
    </div>
  </AdminShell>
);

export default AdminSettings;