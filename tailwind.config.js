/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: 'rgb(28,25,23)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: 'var(--destructive)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        dashboard: {
          bg: '#f3f3f3',
          surface: '#f8f8f8',
          panel: '#f5f5f5',
          border: '#d8d8d8',
          text: '#111111',
          muted: '#7a7a7a',
          subtle: '#a2a2a2',
          active: '#ececec',
        },
      },
      borderRadius: {
        dashboard: '16px',
      },
      boxShadow: {
        dashboard: '0 1px 0 rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        geist: ['"Inter"', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        grostek: ['Space Grotesk', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
