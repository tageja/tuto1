/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    '#0B5FFF',
        'primary-dark': '#0847C8',
        'primary-light': '#EEF3FF',
        accent:     '#10B981',
        surface:    '#F9FAFC',
        'on-surface': '#111827',
        muted:      '#6B7280',
        border:     '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
