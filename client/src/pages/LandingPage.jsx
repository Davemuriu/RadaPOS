import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Users } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-[#0B0F1A] text-white">
            {/* LEFT: Role Selection Area */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-16 lg:px-24">
                <div className="flex items-center gap-2 mb-12">
                    <Zap className="text-indigo-500 fill-current" size={32} />
                    <span className="text-2xl font-bold tracking-tight">RadaPOS</span>
                </div>

                <h1 className="text-4xl font-bold mb-2">Welcome to RadaPOS</h1>
                <p className="text-slate-400 mb-10">Choose your role to continue</p>

                <div className="space-y-4 max-w-sm">
                    {/* Admin Gradient Button */}
                    <button 
                        onClick={() => navigate('/login/admin')}
                        className="w-full py-4 px-6 rounded-xl font-bold text-center bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#10B981] hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        I am an Admin/Host
                    </button>

                    <button className="w-full py-4 px-6 rounded-xl font-bold text-center bg-[#161B22] border border-slate-800 hover:bg-slate-800 transition-all">
                        I am a Vendor
                    </button>

                    <button className="w-full py-4 px-6 rounded-xl font-bold text-center bg-[#161B22] border border-slate-800 hover:bg-slate-800 transition-all">
                        I am a Cashier
                    </button>
                </div>

                <p className="mt-20 text-xs text-slate-500">
                    By continuing, you agree to our <span className="text-indigo-400">Terms of Service</span> and <span className="text-indigo-400">Privacy Policy</span>.
                </p>
            </div>

            {/* RIGHT: Branding Section (Matching Figma) */}
            <div className="hidden lg:flex w-1/2 bg-[#05070A] flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 text-center">
                    <Zap className="mx-auto text-indigo-500 mb-6" size={64} />
                    <h2 className="text-7xl font-black mb-4 tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
                        RadaPOS
                    </h2>
                    <p className="text-2xl font-semibold mb-2">Fintech Point of Sale System</p>
                    <p className="text-slate-500 mb-12">Built for outdoor events. Fast. Reliable. Visible.</p>

                    <div className="space-y-4 text-left w-80 mx-auto">
                        <FeatureItem icon={<Zap size={18} className="text-indigo-400" />} title="Lightning Fast" desc="Quick transactions for busy events" />
                        <FeatureItem icon={<Shield size={18} className="text-emerald-400" />} title="High Contrast" desc="Perfect visibility in any lighting" />
                        <FeatureItem icon={<Users size={18} className="text-rose-400" />} title="Multi-Role Support" desc="Cashiers, Vendors, and Admins" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, title, desc }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
        <div>
            <h4 className="font-bold text-sm">{title}</h4>
            <p className="text-[10px] text-slate-500">{desc}</p>
        </div>
    </div>
);

export default LandingPage;