/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-cyan': '#00f7ff',
        'cyber-pink': '#ff00ea',
        'cyber-yellow': '#ffff00',
        'cyber-dark': '#050505',
      },
    },
  },
  plugins: [],
}
