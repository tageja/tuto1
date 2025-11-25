/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B5FFF',
        background: '#FFFFFF',
        surface: '#F9FAFC',
        onSurface: '#333333',
        disabled: '#888888',
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
};










































