module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfe',
          100: '#bceaed',
          200: '#a3e0e4',
          300: '#8ad6db',
          400: '#71ccd2',
          500: '#bceaed',
          600: '#9bd5da',
          700: '#7abfc4',
          800: '#59a9ae',
          900: '#389398',
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shine: 'shine 1.5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDelay: {
        '2000': '2000ms',
        '4000': '4000ms',
      },
    },
  },
  plugins: [],
};

