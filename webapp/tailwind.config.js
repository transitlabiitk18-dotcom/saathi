/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6f5', 100: '#d5ebe8', 200: '#acd7d1', 300: '#7dbdb5', 400: '#4f9f96',
          500: '#35847b', 600: '#296a63', 700: '#235650', 800: '#1f4642', 900: '#1b3b38',
        },
        sand: { 50: '#fbf8f3', 100: '#f5efe4', 200: '#ebdfca' },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.06)',
      },
    },
  },
  plugins: [],
}
