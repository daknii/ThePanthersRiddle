/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#050303',
        abyss: '#080405',
        crimson: {
          DEFAULT: '#990011',
          blood: '#75000a',
          vivid: '#e6001a',
          glow: 'rgba(230, 0, 26, 0.45)',
          deep: '#4d0007',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
        display: ['Cinzel Decorative', 'Georgia', 'serif'],
      },
      boxShadow: {
        'crimson-eye': '0 0 35px rgba(230, 0, 26, 0.35)',
      }
    },
  },
  plugins: [],
}
