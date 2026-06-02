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
        cyber: {
          bg: '#020617',
          card: '#0f172a',
          primary: '#06b6d4',
          secondary: '#a855f7',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'glow-red': 'glowRed 1.5s ease-in-out infinite alternate',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4' },
          '100%': { boxShadow: '0 0 15px #06b6d4, 0 0 25px #22d3ee' }
        },
        glowRed: {
          '0%': { boxShadow: '0 0 5px #ef4444, 0 0 10px #ef4444' },
          '100%': { boxShadow: '0 0 15px #ef4444, 0 0 25px #f87171' }
        }
      }
    },
  },
  plugins: [],
}
