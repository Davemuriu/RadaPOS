/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapped to CSS variables for Dark/Light mode support
        'rada-bg': 'var(--bg-page)',      // Main App Background
        'rada-card': 'var(--bg-card)',    // Card/Panel Background
        'rada-text': 'var(--text-main)',  // Primary Text
        'rada-muted': 'var(--text-muted)', // Secondary Text
        'rada-border': 'var(--border)',   // Border Color

        // Static Brand Colors (matching CSS hex codes)
        'rada-green': '#10b981',   // Primary Brand (Emerald-500)
        'rada-teal': '#14b8a6',    // Secondary Accents
        'rada-blue': '#3b82f6',    // Cashier/Info (Blue-500)
        'rada-orange': '#f59e0b',  // Admin/Warning (Amber-500)
        'rada-red': '#ef4444',     // Danger/Error (Red-500)

        // Specific Dark Mode Shades (for loading screens/fallbacks)
        'rada-void': '#0b0e11',    // Deep Dark Background
        'rada-surface': '#11141a', // Slightly Lighter Panel
      },
      fontFamily: {
        'sans': ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'rada': '1.25rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.15)', // Green Glow
      }
    },
  },
  plugins: [],
}