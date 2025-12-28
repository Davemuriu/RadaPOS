import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-[#0B0F1A] text-white">
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-16 lg:px-24">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 mb-8 hover:text-white transition">
                    <ArrowLeft size={16} /> Back to role selection
                </button>

                <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
                <p className="text-slate-400 mb-10">Login as <span className="text-indigo-400 font-bold">Admin / Host</span></p>

                <form className="space-y-6 max-w-sm" onSubmit={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }}>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email or Phone</label>
                        <input type="text" className="w-full bg-[#161B22] border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter your email or phone" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                        <input type="password" className="w-full bg-[#161B22] border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter your password" />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                            <input type="checkbox" className="rounded bg-slate-800 border-slate-700" /> Remember me
                        </label>
                        <button type="button" className="text-indigo-400 hover:underline">Forgot password?</button>
                    </div>

                    <button className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-90">
                        Login
                    </button>
                </form>

                <p className="mt-8 text-sm text-slate-500 text-center max-w-sm">
                    New user? <span className="text-indigo-400 cursor-pointer">Create an account</span>
                </p>
            </div>

            {/* Same Branding Right Column as Landing Page */}
            <div className="hidden lg:flex w-1/2 bg-[#05070A] justify-center items-center">
                 {/* Re-use the Branding section from Step 1 */}
            </div>
        </div>
    );
};

export default AdminLogin;