/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        btc: '#F7931A',
        eth: '#627EEA',
        sol: '#9945FF',
        green: { neon: '#00FF94' },
        red: { rekt: '#FF3366' },
      },
      animation: {
        'glitch': 'glitch 2s infinite',
        'scanline': 'scanline 8s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'typewriter': 'typewriter 2s steps(20) forwards',
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { textShadow: '2px 0 #F7931A, -2px 0 #627EEA' },
          '20%': { textShadow: '-2px 0 #F7931A, 2px 0 #627EEA', transform: 'translate(-2px, 0)' },
          '40%': { textShadow: '2px 0 #FF3366, -2px 0 #00FF94', transform: 'translate(2px, 0)' },
          '60%': { textShadow: '-2px 0 #F7931A, 2px 0 #627EEA', transform: 'translate(0, 1px)' },
          '80%': { textShadow: '2px 0 #00FF94, -2px 0 #FF3366', transform: 'translate(0, -1px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px #F7931A, 0 0 40px #F7931A44' },
          '50%': { boxShadow: '0 0 40px #F7931A, 0 0 80px #F7931A88' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(5deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-3deg)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
