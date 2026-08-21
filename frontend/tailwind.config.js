/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#02040a',
          900: '#060913',
          800: '#0c1122',
          700: '#141c33',
        },
        aurora: {
          violet: '#8b5cf6',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          fuchsia: '#d946ef',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.35)',
        'glass-md': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-lg': '0 12px 48px 0 rgba(0, 0, 0, 0.55)',
        'glow-violet': '0 0 25px rgba(139, 92, 246, 0.3)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.3)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
}
