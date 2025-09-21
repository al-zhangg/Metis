/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light blue-gray color scheme with Greek mythology inspiration
        'olympus-white': '#f2ede0',
        'marble': '#f8fafc',
        'slate-mist': '#efe2c2ff',
        'aegean-blue': '#90D5EC',
        'deep-aegean': '#B7C9E2',
        'bronze': '#AADDEC',
        'gold': '#ADD8E6',
        'storm-gray': '#64748b',
        'midnight': '#1e293b',
        'laurel-green': '#C5E3EC',
      },
      fontFamily: {
        // Swap default project fonts: use system/Windows-safe Cambria and Georgia
        'cinzel': ['Georgia', 'serif'],
        'inter': ['Cambria', 'serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}