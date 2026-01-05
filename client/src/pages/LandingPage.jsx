import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-rada-void text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* LEFT */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-indigo-300">
            Welcome to RadaPOS
          </h1>
          <p className="mt-2 text-sm tracking-[0.25em] text-slate-400 uppercase">
            Choose your role to continue
          </p>

          <div className="mt-10 space-y-6">
            <button
              onClick={() => navigate("/admin/login")}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 py-5 font-semibold tracking-wide shadow-lg hover:opacity-95"
            >
              I AM AN ADMIN/HOST
            </button>

            <button
              onClick={() => navigate("/vendor/login")}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 py-5 font-semibold tracking-wide shadow-lg hover:opacity-95"
            >
              I AM A VENDOR
            </button>

            <button
              onClick={() => navigate("/cashier/login")}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 py-5 font-semibold tracking-wide shadow-lg hover:opacity-95"
            >
              I AM A CASHIER
            </button>
          </div>

          <p className="mt-8 text-xs text-slate-500">
            By continuing, you agree to our{" "}
            <span className="text-indigo-300 underline cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-indigo-300 underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center lg:items-end">
          <div className="w-full max-w-xl rounded-3xl bg-black/30 border border-border-soft p-10 shadow-xl">
            <div className="flex items-center justify-center gap-3">
              <div className="text-indigo-300 text-2xl">⚡</div>
              <h2 className="text-5xl font-black">
                <span className="text-white">Rada</span>
                <span className="text-emerald-400">POS</span>
              </h2>
            </div>
            <p className="mt-4 text-center text-lg font-semibold">
              Fintech Point of Sale System
            </p>
            <p className="mt-2 text-center text-xs tracking-[0.3em] text-slate-500 uppercase">
              Built for outdoor events. Fast. Reliable. Visible.
            </p>

            <div className="mt-8 space-y-4">
              <FeatureCard
                title="LIGHTNING FAST"
                desc="Quick transactions for busy events"
              />
              <FeatureCard
                title="HIGH CONTRAST"
                desc="Perfect visibility in any lighting"
              />
              <FeatureCard
                title="MULTI-ROLE SUPPORT"
                desc="Cashiers, vendors, and admins"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-2xl bg-rada-surface border border-border-soft p-5">
      <p className="text-sm font-bold tracking-wide">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  );
}
