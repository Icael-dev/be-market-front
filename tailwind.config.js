/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        white: '#fafafa',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        gold: {
          50: '#fbf7ed',
          100: '#f5ecd3',
          200: '#ecd9a6',
          300: '#e0c178',
          400: '#d4af37',
          500: '#c19a2e',
          600: '#a37f23',
          700: '#855f1d',
          800: '#6f4f1d',
          900: '#5f431b',
        },
      },
      borderRadius: {
        'sm': '0.5rem',
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'hover': '0 10px 30px -10px rgb(37 99 235 / 0.18), 0 4px 12px -4px rgb(0 0 0 / 0.08)',
        'premium': '0 20px 50px -20px rgb(37 99 235 / 0.25), 0 8px 20px -8px rgb(0 0 0 / 0.12)',
        'gold': '0 8px 24px -8px rgb(212 175 55 / 0.35)',
      },
      letterSpacing: {
        'tightest': '-0.04em',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
