/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f5f7fa',
          100: '#e9edf5',
          200: '#d8dfe8',
          300: '#b8c7da',
          400: '#94a9c4',
          500: '#7a93b4',
          600: '#5e79a2',
          700: '#4f6689',
          800: '#425573',
          900: '#37475f',
        },
        'neutral': {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        }
      },
    },
  },
  plugins: [],
}
