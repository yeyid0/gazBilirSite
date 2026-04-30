/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          void:      '#000000',
          primary:   '#09090b',
          secondary: '#18181b',
          elevated:  '#27272a',
          card:      '#09090b',
        },
        ink: {
          primary:   '#ffffff',
          secondary: '#a1a1aa',
          muted:     '#71717a',
          accent:    '#60a5fa',
        },
      },
      fontFamily: {
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'Menlo', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
        xl:  '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'card':  '0 4px 12px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        'card-lg': '0 16px 48px rgba(0,0,0,0.7), 0 8px 16px rgba(0,0,0,0.4)',
        'glow-blue': '0 0 24px -4px rgba(59, 130, 246, 0.4)',
        'glow-sm':   '0 0 20px -5px rgba(255, 255, 255, 0.1)',
        'inner':     'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        'gradient-card':  'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
        'grid-pattern': "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
      },
      animation: {
        'fade-up':   'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':   'fadeIn 0.4s ease both',
        'scale-in':  'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-dot': 'pulse 2.5s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
