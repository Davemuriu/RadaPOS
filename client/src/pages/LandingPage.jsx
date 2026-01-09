import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const ROLES = [
    { label: "I am an Admin/Host", path: "/admin/login" },
    { label: "I am a Vendor", path: "/vendor/login" },
    { label: "I am a Cashier", path: "/cashier/login" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0B0E11] text-white font-sans overflow-hidden">
      
      {/* LEFT SIDE: ROLE SELECTION */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-24 justify-center items-center">
        <div className="max-w-md mx-auto w-full space-y-10 text-center">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to RadaPOS
            </h1>
            <p className="text-gray-400 text-md">
              Choose your role to continue
            </p>
          </header>

          <nav className="space-y-4">
            {ROLES.map((role) => (
              <button
                key={role.label}
                onClick={() => navigate(role.path)}
                className="w-full py-4 px-6 rounded-xl font-semibold text-base text-white border-transparent transition-all duration-300 bg-gradient-to-r from-[#7B61FF] via-[#5AC8FA] to-[#34C759] shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] hover:brightness-110"
              >
                {role.label}
              </button>
            ))}
          </nav>

          <footer className="pt-10">
            <p className="text-gray-500 text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <button className="text-[#7B61FF] hover:underline">Terms of Service</button> and{" "}
              <button className="text-[#7B61FF] hover:underline">Privacy Policy</button>
            </p>
          </footer>
        </div>
      </div>

      {/* RIGHT SIDE: BRANDING PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B0E11] border-l border-gray-800 relative items-center justify-center">
        {/* Deep background glow */}
        <div className="absolute w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        
        <div className="relative z-10 text-center max-w-lg px-8">
          <div className="flex flex-col items-center mb-6">
            <div className="text-[#7B61FF] text-4xl mb-2">⚡</div>
            <h2 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-[#7B61FF] via-[#5AC8FA] to-[#34C759] bg-clip-text text-transparent">
              RadaPOS
            </h2>
          </div>
          
          <div className="space-y-1">
            <p className="text-white text-xl font-semibold">
              Fintech Point of Sale System
            </p>
            <p className="text-gray-500 text-sm">
              Built for outdoor events. Fast. Reliable. Visible.
            </p>
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
    <div className="flex items-center gap-4 bg-[#11141A] p-4 rounded-xl border border-gray-800/50 transition-all hover:bg-[#161B22]">
      <div className="w-10 h-10 bg-[#161B22] rounded-lg flex items-center justify-center text-lg shadow-inner">
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm text-white">{title}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
    </div>
  );
}