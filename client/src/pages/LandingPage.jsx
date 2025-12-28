import React, { useState } from 'react';
import { Zap, Globe, Users, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  // State to swap between Role Selection and Login Form
  const [selectedRole, setSelectedRole] = useState(null);

  // Function to return to the Selection View
  const handleBack = () => setSelectedRole(null);

  // Fix: Prevents page reload and navigates to the dashboard
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === 'Admin') {
      navigate('/admin-dashboard'); // Ensure this route exists in your App.js
    } else {
      // Logic for Vendor or Cashier can go here
      console.log(`${selectedRole} login attempted`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050816] text-white font-sans overflow-hidden">
      
      {/* --- LEFT SIDE: DYNAMIC CONTENT --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-10 md:px-24 bg-[#050816] relative border-r border-slate-800/20">
        
        {!selectedRole ? (
          /* VIEW A: ROLE SELECTION (image_182fc7.jpg) */
          <div className="max-w-md w-full animate-in fade-in duration-500">
            <header className="mb-12 text-center">
              {/* Mixed Case Gradient Title: Dark Purple to Green */}
              <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-indigo-900 via-indigo-600 to-[#10b981] bg-clip-text text-transparent">
                Welcome to RadaPOS
              </h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.15em]">
                Choose your role to continue
              </p>
            </header>

            <div className="space-y-6">
              {/* Blue-Green Gradient Buttons with Thick Borders */}
              <PortalButton label="I am an Admin/Host" onClick={() => setSelectedRole('Admin')} />
              <PortalButton label="I am a Vendor" onClick={() => setSelectedRole('Vendor')} />
              <PortalButton label="I am a Cashier" onClick={() => setSelectedRole('Cashier')} />
            </div>

            <div className="mt-12 text-center">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                By continuing, you agree to our <span className="text-indigo-400 cursor-pointer hover:underline">Terms of Service</span> and <br />
                <span className="text-indigo-400 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>
          </div>
        ) : (
          /* VIEW B: LOGIN FORM (image_0e239a.jpg) */
          <div className="max-w-md w-full animate-in zoom-in-95 duration-300">
            <button 
              onClick={handleBack}
              className="absolute top-12 left-10 lg:left-20 flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest group"
            >
              <ChevronLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to role selection
            </button>

            <header className="mb-10 text-center">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                Login as <span className="text-indigo-500">{selectedRole}</span>
              </p>
            </header>

            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Email or Phone</label>
                <input 
                  required
                  type="text" 
                  placeholder={`Enter ${selectedRole} credentials`}
                  className="w-full bg-[#f8faff] border-none rounded-2xl p-5 font-bold text-[#020617] outline-none focus:ring-4 focus:ring-indigo-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Password</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••"
                  className="w-full bg-[#f8faff] border-none rounded-2xl p-5 font-bold text-[#020617] outline-none focus:ring-4 focus:ring-indigo-500/20"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-blue-700 to-emerald-600 text-white font-bold rounded-2xl shadow-xl uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform active:scale-95"
              >
                Login
              </button>
            </form>
          </div>
        )}
      </div>

      {/* --- RIGHT SIDE: RadaPOS BRANDING (image_182fc7.jpg) --- */}
      <div className="hidden lg:flex w-1/2 bg-[#02040a] relative flex-col justify-center items-center p-20 text-center">
        <div className="absolute top-20 flex flex-col items-center">
             <Zap className="text-indigo-500 fill-indigo-500 animate-pulse" size={40} />
        </div>
        
        <div className="relative z-10 w-full flex flex-col items-center mt-10">
            {/* Mixed-case Branding Logo */}
            <h2 className="text-7xl font-bold text-white tracking-[-0.04em] mb-4">
                Rada<span className="text-emerald-500">POS</span>
            </h2>
            <p className="text-white text-xl font-bold tracking-tight mb-2">Fintech Point of Sale System</p>
            <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-[9px] mb-16">
                Built for outdoor events. Fast. Reliable. Visible.
            </p>

            <div className="w-full max-w-sm space-y-3 text-left">
                <FeatureCard title="Lightning Fast" desc="Quick transactions for busy events" icon={<Zap size={18} className="fill-white"/>} color="bg-[#4f46e5]" />
                <FeatureCard title="High Contrast" desc="Perfect visibility in any lighting" icon={<Globe size={18}/>} color="bg-[#10b981]" />
                <FeatureCard title="Multi-Role Support" icon={<Users size={18} className="fill-white"/>} desc="Cashiers, Vendors, and Admins" color="bg-[#e11d48]" />
            </div>
        </div>
      </div>
    </div>
  );
};

// Portal Button: Blue-Green Gradient, Thick Border, Bulge Effect
const PortalButton = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full py-5 rounded-2xl font-bold uppercase tracking-[0.1em] text-sm transition-all duration-300 
               bg-gradient-to-r from-blue-600 to-emerald-500 border-4 border-slate-700/50 
               hover:border-white hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] 
               active:scale-95 shadow-lg"
  >
    {label}
  </button>
);

const FeatureCard = ({ title, desc, icon, color }) => (
  <div className="bg-[#0b0f1a] border border-slate-800/50 p-4 rounded-[20px] flex items-center gap-4 shadow-lg">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
        {icon}
    </div>
    <div>
        <h4 className="text-white font-bold uppercase text-[11px] tracking-widest leading-none">{title}</h4>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight mt-1 opacity-70">{desc}</p>
    </div>
  </div>
);

export default LandingPage;