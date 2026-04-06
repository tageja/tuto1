/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B5FFF',
          dark: '#0952E0',
          light: '#E5EFFF',
        },
        bg: '#FFFFFF',
        surface: '#F9FAFC',
        border: '#E5E7EB',
        text: '#333333',
        'text-muted': '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s cubic-bezier(0.22,1,0.36,1)',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.22,1,0.36,1)',
        'step-enter': 'stepEnter 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'count-up': 'countUp 1s ease-out both',
        'stagger-1': 'stepEnter 0.35s 0.05s cubic-bezier(0.22,1,0.36,1) both',
        'stagger-2': 'stepEnter 0.35s 0.1s cubic-bezier(0.22,1,0.36,1) both',
        'stagger-3': 'stepEnter 0.35s 0.15s cubic-bezier(0.22,1,0.36,1) both',
        'stagger-4': 'stepEnter 0.35s 0.2s cubic-bezier(0.22,1,0.36,1) both',
        'stagger-5': 'stepEnter 0.35s 0.25s cubic-bezier(0.22,1,0.36,1) both',
        'stagger-6': 'stepEnter 0.35s 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideLeft: { from: { transform: 'translateX(-16px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideRight: { from: { transform: 'translateX(16px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        stepEnter: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        countUp: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(11,95,255,0)' }, '50%': { boxShadow: '0 0 0 6px rgba(11,95,255,0.15)' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
