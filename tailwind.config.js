import colors from 'tailwindcss/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: 'var(--color-forest)',
        carbon: 'var(--color-carbon)',
        emerald: {
          ...colors.emerald,
          DEFAULT: 'var(--color-emerald)',
        },
        amber: {
          ...colors.amber,
          DEFAULT: 'var(--color-amber)',
        },
        registry: 'var(--color-registry)',
        mist: 'var(--color-mist)',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
