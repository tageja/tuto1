// Tailwind configuration
export const tailwindConfig = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
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
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'caption': '12px',
        'body': '16px',
        'subtitle': '20px',
        'header': '24px',
      },
      spacing: {
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
      },
    },
  },
  plugins: [],
}


