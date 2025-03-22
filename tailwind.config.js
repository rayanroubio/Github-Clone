/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'github-dark': '#24292e',
        'github-btn': '#2ea44f',
        'github-btn-hover': '#2c974b',
        'github-header-search': '#3f4448',
        'github-border': '#e1e4e8',
        'github-text': '#586069',
        'github-link': '#0366d6',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 