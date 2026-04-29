/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(5,150,105)',
        accent: 'rgb(245,158,11)',
        secondary: 'rgb(28,25,23)',
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
