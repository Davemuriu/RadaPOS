/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rada-void': '#020617',     // Main Background
        'rada-surface': '#0B0F1A',  // Card/Sidebar Background
        'rada-accent': '#6366f1',   // Primary Indigo
        'rada-success': '#10b981',  // Emerald Success
        'rada-warning': '#f97316',  // Orange Warning
        'rada-danger': '#f43f5e',   // Rose Danger
        'border-soft': 'rgba(71, 85, 105, 0.2)', // Slate-800/20
      },
      borderRadius: {
        'rada': '2.5rem', // The 40px rounding you like
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

