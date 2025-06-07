/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './frontend/**/*.{js,ts,jsx,tsx}',
    "./index.html"
  ], // 👈 where Tailwind looks for class usage
  theme: {
    extend: {}, // 👈 you can customize breakpoints, colors, spacing, etc.
  },
  plugins: [require('daisyui')], // 👈 use DaisyUI plugin
  daisyui: {
    themes: ['light', 'dark', 'cupcake', 'fantasy/'], // 👈 DaisyUI themes to include
    darkTheme: 'dark', // 👈 default dark mode theme
  },
};
