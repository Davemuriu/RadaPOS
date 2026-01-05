import React from 'react';
import AdminShell from './components/AdminShell';

const AdminReports = () => {
  return (
    <AdminShell title="POS Terminal Reports">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Terminal Summary Card */}
        <div className="admin-card">
          <div className="admin-card-header bg-rada-void/50">
            <h3 className="admin-card-title text-sm tracking-widest">Active Session: Z-REPORT</h3>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex justify-between border-b border-border-soft pb-2">
              <span className="admin-field-label">Gross Sales</span>
              <span className="text-white font-mono">$8,450.20</span>
            </div>
            <div className="flex justify-between border-b border-border-soft pb-2">
              <span className="admin-field-label">Discounts</span>
              <span className="text-rada-danger font-mono">-$210.00</span>
            </div>
            <div className="flex justify-between pt-4">
              <span className="text-rada-accent font-black uppercase">Net Total</span>
              <span className="text-2xl text-white font-black font-mono">$8,240.20</span>
            </div>
            <button className="btn-admin-primary w-full mt-6 py-4">PRINT END OF DAY REPORT</button>
          </div>
        </div>

        {/* Historical Logs Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title text-sm italic">Historical Exports</h3>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between p-4 bg-rada-void rounded-lg border border-border-soft">
              <span className="text-xs font-black text-white">MONTHLY_TAX_LOG.CSV</span>
              <button className="text-rada-accent text-[10px] font-bold underline">DOWNLOAD</button>
            </div>
            <div className="flex items-center justify-between p-4 bg-rada-void rounded-lg border border-border-soft">
              <span className="text-xs font-black text-white">VENDOR_PAYOUTS_JAN.PDF</span>
              <button className="text-rada-accent text-[10px] font-bold underline">DOWNLOAD</button>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
};

export default AdminReports;