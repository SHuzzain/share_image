/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-to-c': 'linear-gradient(30deg, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: ['tailwind-scrollbar-hide'],
}
