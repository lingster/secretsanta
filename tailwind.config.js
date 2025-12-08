/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#C41E3A',
          green: '#165B33',
          darkgreen: '#0F4C24',
          white: '#FFFAFA',
          cream: '#F5F5DC',
          brown: '#8B4513',
          gold: '#FFD700',
        }
      },
      fontFamily: {
        christmas: ['Comic Sans MS', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
