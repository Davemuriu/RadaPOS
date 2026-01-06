import React, { useState } from 'react';
import AdminShell from './AdminShell';
import { Database, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

const AdminSettings = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const handleInitializeDB = async () => {
    if (!window.confirm("Initialize Database? This will create 'radapos.db' and all system tables. This should only be done once.")) return;
    
    setIsInitializing(true);
    setStatus(null);
    
    try {
      const response = await fetch("http://localhost:5555/api/admin/db-init", {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        alert("Success: " + data.message);
      } else {
        setStatus('error');
        alert("Error: " + data.message);
      }
    } catch (error) {
      setStatus('error');
      alert("Connection failed. Ensure your Python backend is running.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <AdminShell title="Terminal Configuration">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
        
        {/* NEW: Database Initialization Card */}
        <div className="admin-card p-8 space-y-6 border-l-4 border-indigo-500 bg-indigo-500/5">
          <div className="flex items-center justify-between">
            <h3 className="admin-field-label flex items-center gap-2">
              <Database size={18} className="text-indigo-400" /> System Database
            </h3>
            {status === 'success' && <CheckCircle2 size={18} className="text-green-500" />}
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-rada-void rounded border border-indigo-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-1 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Click below to generate the physical <code className="text-indigo-300">radapos.db</code> file. 
                  This will finalize the transition from mock data to real storage.
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleInitializeDB}
              disabled={isInitializing}
              className={`w-full py-4 rounded font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 
                ${isInitializing ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'}`}
            >
              {isInitializing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Database size={16} />
              )}
              {isInitializing ? "Processing..." : "Run Database Setup"}
            </button>
          </div>
        </div>

        {/* Existing: Hardware Parameters */}
        <div className="admin-card p-8 space-y-6">
          <h3 className="admin-field-label text-slate-300">Hardware Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Printer Thermal Width</label>
              <select className="admin-select w-full mt-1 bg-rada-void border-border-soft text-white text-sm p-2 rounded">
                <option>80mm (Standard)</option>
                <option>58mm (Compact)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Drawer Pulse Duration</label>
              <input className="admin-input mt-1 w-full bg-rada-void border-border-soft text-white text-sm p-2 rounded" defaultValue="250ms" />
            </div>
          </div>
        </div>

        {/* Existing: Security Protocol */}
        <div className="admin-card p-8 space-y-6">
          <h3 className="admin-field-label text-slate-300">Security Protocol</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-rada-void rounded border border-border-soft">
                <span className="text-xs text-white uppercase font-bold">Auto-Lock (5min)</span>
                <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                </div>
             </div>
             <button className="w-full py-4 uppercase text-xs font-bold border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded transition-colors">
               Purge Local Cache
             </button>
          </div>
        </div>

      </div>
    </AdminShell>
  );
};

export default AdminSettings;