/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#23424A',
        secondary: '#CDE8E5',
        accent: '#F6C6EA',
        background: '#FFFFFF',
        text: '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Forum', 'cursive'],
      },
    }
  },
  plugins: [],
}