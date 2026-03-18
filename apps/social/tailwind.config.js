/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // tuto.social design tokens
        primary:     '#0B5FFF',
        'primary-dark': '#0047CC',
        accent:      '#6366F1',
        surface:     '#F9FAFC',
        'text-primary':   '#111827',
        'text-secondary': '#6B7280',
        success:     '#10B981',
        achievement: '#F59E0B',
        'dark-bg':   '#0A0F1C',
        'dark-surface': '#111827',
        // Role badge colors
        'role-student':     '#0B5FFF',
        'role-parent':      '#10B981',
        'role-teacher':     '#8B5CF6',
        'role-schoolAdmin': '#F97316',
        // Reaction colors
        'reaction-like':    '#FF3B5C',
        'reaction-applaud': '#6366F1',
        'reaction-curious': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card:   '16px',
        button: '12px',
        pill:   '9999px',
        modal:  '24px',
      },
      spacing: {
        // 4pt grid
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '5':  '20px',
        '6':  '24px',
        '8':  '32px',
      },
    },
  },
  plugins: [],
};
