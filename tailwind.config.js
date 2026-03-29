/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark palette from design system
        harbour: {
          bg:        '#0F172A',
          surface:   '#1E293B',
          elevated:  '#334155',
          border:    '#475569',
          muted:     '#94A3B8',
          text:      '#F8FAFC',
          'text-dim':'#CBD5E1',
        },
        // Green CTA / brand
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        heading: ['Fira Code', 'monospace'],
        body:    ['Fira Sans', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(34,197,94,0.25)',
        'glow-sm': '0 0 8px rgba(34,197,94,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
