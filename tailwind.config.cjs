/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a0f',
          surface: '#0d1117',
          border: '#00ff9f',
          accent: '#00ff9f',
          accent2: '#00b8ff',
          accent3: '#ff0055',
          text: '#c9d1d9',
          muted: '#485060',
          glow: 'rgba(0,255,159,0.15)'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace']
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'scan': 'scan 4s linear infinite',
        'flicker': 'flicker 0.15s infinite'
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)', opacity: '0.8' },
          '40%': { transform: 'translate(2px, -2px)', opacity: '0.9' },
          '60%': { transform: 'translate(-1px, 1px)' },
          '80%': { transform: 'translate(1px, -1px)', opacity: '0.85' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' }
        }
      },
      boxShadow: {
        'cyber': '0 0 10px rgba(0,255,159,0.3), 0 0 40px rgba(0,255,159,0.1)',
        'cyber-strong': '0 0 20px rgba(0,255,159,0.5), 0 0 60px rgba(0,255,159,0.2)',
        'cyber-blue': '0 0 10px rgba(0,184,255,0.3), 0 0 40px rgba(0,184,255,0.1)'
      }
    }
  },
  plugins: []
}
