/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // ── Existing dashboard palette (unchanged) ──
        brand: {
          50:  '#eef2ff',
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
        surface: {
          DEFAULT: '#0f172a',
          card:    '#1e293b',
          border:  '#334155',
          hover:   '#293548',
        },
        // ── Landing page palette ──
        bp: {
          bg:       '#080B0F',
          surface:  '#0D1117',
          card:     '#11161D',
          border:   'rgba(255,255,255,0.08)',
          blue:     '#3B82F6',
          'blue-hover': '#2563EB',
          cyan:     '#22D3EE',
          muted:    '#6B7280',
          subtle:   '#374151',
          text:     '#F9FAFB',
          'text-secondary': '#9CA3AF',
          'text-muted': '#6B7280',
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-surface': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        // Landing page gradients
        'bp-hero-glow':     'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(34, 211, 238, 0.08) 0%, rgba(59, 130, 246, 0.12) 40%, transparent 70%)',
        'bp-blue-glow':     'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        'bp-card-glow':     'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(34, 211, 238, 0.03) 100%)',
      },
      animation: {
        // Existing
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Landing page
        'node-pulse': 'nodePulse 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        'draw-line':  'drawLine 1s ease-out forwards',
        'count-up':   'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        // Existing
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        // Landing page
        nodePulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.15)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        drawLine: {
          from: { strokeDashoffset: '1000' },
          to:   { strokeDashoffset: '0' },
        },
      },
      boxShadow: {
        'bp-card':  '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'bp-blue':  '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
        'bp-glow':  '0 0 60px rgba(59, 130, 246, 0.2)',
        'bp-hover': '0 0 0 1px rgba(59, 130, 246, 0.4), 0 8px 32px rgba(59, 130, 246, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
