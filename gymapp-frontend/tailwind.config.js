/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#1E40AF',
        'primary-light': '#DBEAFE',
      },
    },
  },
  plugins: [],
}