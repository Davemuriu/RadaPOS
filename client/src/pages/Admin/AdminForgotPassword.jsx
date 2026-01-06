import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would call your API to send the reset link
    setSent(true);
  };

  return (
    <div className="min-h-screen flex bg-[#0B0E11] text-white font-sans overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center items-center">
        <div className="max-w-md mx-auto w-full">
          <button 
            type="button"
            onClick={() => navigate("/admin/login")}
            className="group flex items-center text-gray-500 text-sm mb-8 transition-colors hover:text-gray-300"
          >
            <span className="mr-2 transform transition-transform group-hover:-translate-x-1">←</span> 
            Back to login
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Reset Password</h1>
            <p className="text-gray-400">
              Enter your email to receive a <span className="text-indigo-500 font-semibold">Reset Link</span>
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-medium text-gray-400 mb-2 tracking-wide uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#161B22] border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7B61FF] via-[#5AC8FA] to-[#34C759] text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center p-8 bg-emerald-500/10 border border-emerald-500/50 rounded-2xl">
              <p className="text-emerald-400 font-medium">Check your inbox!</p>
              <p className="text-gray-400 text-sm mt-2">If an account exists for {email}, you will receive a link shortly.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: BRANDING (Matches your Login/Landing Page) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B0E11] border-l border-gray-800 relative items-center justify-center">
        <div className="relative z-10 text-center max-w-lg px-8">
          <div className="flex flex-col items-center mb-6">
            <div className="text-[#7B61FF] text-4xl mb-2">⚡</div>
            <h2 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-[#7B61FF] via-[#5AC8FA] to-[#34C759] bg-clip-text text-transparent">
              RadaPOS
            </h2>
          </div>
          <p className="text-white text-xl font-semibold">Fintech Point of Sale System</p>
        </div>
      </div>
    </div>
  );
}