/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This ensures Tailwind scans ALL subfolders
  ],
  theme: {
    extend: {
      // You can add your Figma specific colors here if needed
      colors: {
        'rada-dark': '#0B0F1A',
        'rada-indigo': '#7C3AED',
      }
    },
  },
  plugins: [],
}