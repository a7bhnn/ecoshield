/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hazard: {
          low: '#10b981',        // Emerald
          moderate: '#f59e0b',   // Amber
          high: '#f97316',       // Orange
          critical: '#ef4444',   // Red
        },
        shield: {
          dark: '#080c14',
          card: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          accent: '#06b6d4',     // Cyan
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
