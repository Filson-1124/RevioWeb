// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'hsm': {'raw': '(min-height: 600px)'},
        'hmd': {'raw': '(min-height: 800px)'},
        'hlg': {'raw': '(min-height: 1000px)'},
      },
    },
  },
  plugins: [],
}
