/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080b14',
          900: '#0b1120',
          850: '#0f1626',
          800: '#111a2e',
          750: '#16223b',
          700: '#1c2a47',
          600: '#28365a',
        },
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd3ff',
          300: '#8eb6ff',
          400: '#598dff',
          500: '#3366ff',
          600: '#1f4ff0',
          700: '#1a3fd1',
          800: '#1c37a8',
          900: '#1d3385',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        success: { 500: '#10b981', 600: '#059669' },
        warning: { 400: '#fbbf24', 500: '#f59e0b' },
        error: { 400: '#f87171', 500: '#ef4444' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(51,102,255,0.25), 0 10px 40px -10px rgba(51,102,255,0.35)',
        soft: '0 10px 30px -15px rgba(0,0,0,0.6)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        pulseDot: 'pulseDot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
