/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4fbf5',
          100: '#eaf8eb',
          200: '#d0f0d5',
          300: '#a3dfae',
          400: '#6ac77e',
          500: '#2f9d4f',
          600: '#238042',
          700: '#1f6737',
          800: '#1d4f2f',
          900: '#1a4029',
        },
        soil: '#d9b17a',
        field: '#f4efdd',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(31, 103, 55, 0.08)',
      },
    },
  },
  plugins: [],
};
