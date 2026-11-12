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
        bg: {
          canvas: 'var(--color-bg-canvas)',
          surface: 'var(--color-bg-surface)',
          muted: 'var(--color-bg-muted)',
          elevated: 'var(--color-bg-elevated)',
        },
        fg: {
          primary: 'var(--color-fg-primary)',
          secondary: 'var(--color-fg-secondary)',
          muted: 'var(--color-fg-muted)',
          accent: 'var(--color-fg-accent)',
        },
        border: {
          theme: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
          card: 'var(--color-card-border)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-default)',
          hover: 'var(--color-accent-hover)',
          active: 'var(--color-accent-active)',
          muted: 'var(--color-accent-muted)',
        },
        bkash: 'var(--color-brand-bkash)',
        nagad: 'var(--color-brand-nagad)',
        rocket: 'var(--color-brand-rocket)',
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
