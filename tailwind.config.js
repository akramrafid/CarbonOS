import colors from 'tailwindcss/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        surface: {
          base: 'var(--color-surface-base)',
          muted: 'var(--color-surface-muted)',
          strong: 'var(--color-surface-strong)',
          card: 'var(--color-card-bg)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          theme: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
          card: 'var(--color-card-border)',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
