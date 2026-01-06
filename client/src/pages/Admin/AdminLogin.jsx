import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      if (onLogin) onLogin(data.user);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B0E11] text-white font-sans overflow-hidden">
      {/* LEFT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 justify-center items-center">
        <div className="max-w-md mx-auto w-full">
          {/* Back Button */}
          <div className="flex justify-center lg:justify-start">
            <button 
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center text-gray-500 text-sm mb-8 transition-colors hover:text-gray-300"
            >
              <span className="mr-2 transform transition-transform group-hover:-translate-x-1">←</span> 
              Back to role selection
            </button>
          </div>
          
          {/* CENTERED HEADER SECTION */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-gray-400">
              Login as <span className="text-indigo-500 font-semibold text-lg ml-1">Admin / Host</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-2 tracking-wide uppercase">Email or Phone</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or phone"
                className="w-full bg-[#161B22] border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder:text-gray-600 text-sm"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-medium text-gray-400 tracking-wide uppercase">Password</label>
                {/* FIXED: Added onClick and navigate */}
                <button 
                  type="button" 
                  onClick={() => navigate("/admin/forgot-password")}
                  className="text-[10px] uppercase font-bold text-indigo-500 hover:text-indigo-400 transition-colors tracking-widest"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#161B22] border border-gray-800 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder:text-gray-600 text-sm"
                required
              />
            </div>

            <div className="flex items-center justify-center lg:justify-start">
              <input type="checkbox" id="remember" className="rounded bg-gray-800 border-gray-700 text-indigo-500 focus:ring-indigo-500" />
              <label htmlFor="remember" className="ml-2 text-xs text-gray-500 font-medium cursor-pointer">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#7B61FF] via-[#5AC8FA] to-[#34C759] text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
            >
              {loading ? "Verifying Access..." : "Login"}
            </button>
          </form>

          <div className="mt-12 text-center">
             <button 
               type="button"
               onClick={() => window.open('mailto:support@radapos.com')}
               className="text-gray-600 text-[10px] uppercase tracking-widest font-bold hover:text-gray-400 transition-colors"
             >
               Need help? <span className="text-indigo-500 ml-1">Contact Support</span>
             </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: BRANDING PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B0E11] border-l border-gray-800 relative items-center justify-center">
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="relative z-10 text-center max-w-lg px-8">
          <div className="flex flex-col items-center mb-6">
            <div className="text-[#7B61FF] text-4xl mb-2">⚡</div>
            <h2 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-[#7B61FF] via-[#5AC8FA] to-[#34C759] bg-clip-text text-transparent">
              RadaPOS
            </h2>
          </div>
          <div className="space-y-1">
            <p className="text-white text-xl font-semibold">Fintech Point of Sale System</p>
            <p className="text-gray-500 text-sm">Built for outdoor events. Fast. Reliable. Visible.</p>
          </div>
          <div className="mt-12 space-y-3 text-left">
            <FeatureCard icon="⚡" title="Lightning Fast" desc="Quick transactions for busy events" />
            <FeatureCard icon="🛡️" title="High Contrast" desc="Perfect visibility in any lighting" />
            <FeatureCard icon="👥" title="Multi-Role Support" desc="Cashiers, Vendors, and Admins" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-4 bg-[#11141A] p-4 rounded-xl border border-gray-800/50">
      <div className="w-10 h-10 bg-[#161B22] rounded-lg flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm text-white">{title}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
    </div>
  );
}