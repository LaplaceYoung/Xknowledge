/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        x: {
          bg: 'var(--x-bg)',
          bgHover: 'var(--x-bg-hover)',
          text: 'var(--x-text)',
          textMuted: 'var(--x-text-muted)',
          border: 'var(--x-border)',
          primary: 'var(--x-primary)',
          primaryHover: 'var(--x-primary-hover)',
        }
      },
      fontFamily: {
        sans: [
          '"TwitterChirp"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'x-button': '9999px',
        'x-card': '16px',
      }
    },
  },
  plugins: [],
}
