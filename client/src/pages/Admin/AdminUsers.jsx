import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, Mail } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Manager' });

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5555/api/admin/users", {
        method: 'GET',
        headers: { 
          "X-User-Role": "Administrator",
          "Content-Type": "application/json"
        }
      });
      
      // Safety check: if server sends 405 or 500 HTML error
      if (!res.ok) {
        const text = await res.text();
        console.error("Server Error Response:", text);
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Connection Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:5555/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "X-User-Role": "Administrator" 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const result = await res.json();
        alert(result.message);
        setIsModalOpen(false);
        fetchUsers();
      } else {
        alert("Action failed. Check console.");
      }
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="p-20 text-center text-white bg-[#0B0E11] min-h-screen">Connecting...</div>;

  return (
    <div className="p-8 text-white bg-[#0B0E11] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all">
          <UserPlus size={20} /> Invite New Admin
        </button>
      </div>

      <div className="bg-[#11141A] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-[#0B0E11]/50 text-gray-500 text-[10px] uppercase border-b border-gray-800">
            <tr>
              <th className="px-6 py-5">Identity</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.length > 0 ? users.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-semibold text-sm">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-5 text-sm">{u.role}</td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black border uppercase ${u.status === 'active' ? 'text-green-500 border-green-500/20' : 'text-amber-500 border-amber-500/20'}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="p-10 text-center text-gray-600 italic">No admin users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#11141A] w-full max-w-md rounded-3xl border border-gray-800 p-8 shadow-2xl relative">
            <h2 className="text-xl font-bold mb-6">Send Admin Invitation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Name" className="w-full bg-[#0B0E11] border border-gray-800 rounded-xl px-4 py-3 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full bg-[#0B0E11] border border-gray-800 rounded-xl px-4 py-3 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <select className="w-full bg-[#0B0E11] border border-gray-800 rounded-xl px-4 py-3 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Administrator">Administrator</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
              </select>
              <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 py-4 rounded-xl font-bold uppercase text-xs">
                {isSubmitting ? <Loader2 size={18} className="animate-spin mx-auto"/> : 'Generate Invite Link'}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 text-xs mt-2">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}