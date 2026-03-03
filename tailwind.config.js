/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#060c14',
          1: '#0b1220',
          2: '#0f1a2e',
        },
      },
    },
  },
  plugins: [],
}
