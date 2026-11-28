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
        /* [COMMENTED OUT FOR PERSONAL REFERENCE — raw var(--color-*) strings failed Tailwind v3 /opacity modifiers]
        bg: {
          canvas: 'var(--color-bg-canvas)',
          surface: 'var(--color-bg-surface)',
          muted: 'var(--color-bg-muted)',
          elevated: 'var(--color-bg-elevated)',
        },
        fg: {
          primary: 'var(--color-fg-primary)',
        },
        bkash: 'var(--color-brand-bkash)',
        nagad: 'var(--color-brand-nagad)',
        rocket: 'var(--color-brand-rocket)',
        */
        bg: {
          canvas: 'rgb(var(--color-bg-canvas-rgb) / <alpha-value>)',
          surface: 'rgb(var(--color-bg-surface-rgb) / <alpha-value>)',
          muted: 'rgb(var(--color-bg-muted-rgb) / <alpha-value>)',
          elevated: 'rgb(var(--color-bg-elevated-rgb) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--color-fg-primary-rgb) / <alpha-value>)',
          primary: 'rgb(var(--color-fg-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--color-fg-secondary-rgb) / <alpha-value>)',
          muted: 'rgb(var(--color-fg-muted-rgb) / <alpha-value>)',
          accent: 'rgb(var(--color-fg-accent-rgb) / <alpha-value>)',
          inverse: 'rgb(var(--color-fg-inverse-rgb) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border-subtle-rgb) / <alpha-value>)',
          theme: 'rgb(var(--color-border-strong-rgb) / <alpha-value>)',
          subtle: 'rgb(var(--color-border-subtle-rgb) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong-rgb) / <alpha-value>)',
          card: 'rgb(var(--color-border-subtle-rgb) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent-default-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover-rgb) / <alpha-value>)',
          active: 'rgb(var(--color-accent-active-rgb) / <alpha-value>)',
          muted: 'rgb(var(--color-accent-default-rgb) / 0.12)',
        },
        bkash: 'rgb(var(--color-brand-bkash-rgb) / <alpha-value>)',
        nagad: 'rgb(var(--color-brand-nagad-rgb) / <alpha-value>)',
        rocket: 'rgb(var(--color-brand-rocket-rgb) / <alpha-value>)',
        forest: 'rgb(var(--color-forest-rgb) / <alpha-value>)',
        // [COMMENTED OUT FOR PERSONAL REFERENCE — single string token left 54 carbon-* utility classes unmapped]
        // carbon: 'var(--color-carbon)',
        carbon: {
          DEFAULT: 'rgb(var(--color-carbon-rgb) / <alpha-value>)',
          surface: 'rgb(var(--color-bg-surface-rgb) / <alpha-value>)',
          'surface-raised': 'rgb(var(--color-bg-elevated-rgb) / <alpha-value>)',
          border: 'rgb(var(--color-border-subtle-rgb) / <alpha-value>)',
          text: 'rgb(var(--color-fg-primary-rgb) / <alpha-value>)',
          'text-muted': 'rgb(var(--color-fg-muted-rgb) / <alpha-value>)',
        },
        emerald: {
          ...colors.emerald,
          DEFAULT: 'rgb(var(--color-emerald-rgb) / <alpha-value>)',
        },
        amber: {
          ...colors.amber,
          DEFAULT: 'rgb(var(--color-amber-rgb) / <alpha-value>)',
        },
        registry: 'rgb(var(--color-registry-rgb) / <alpha-value>)',
        mist: 'rgb(var(--color-mist-rgb) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-bg-surface-rgb) / <alpha-value>)',
          2: 'rgb(var(--color-bg-elevated-rgb) / <alpha-value>)',
          base: 'rgb(var(--color-bg-canvas-rgb) / <alpha-value>)',
          muted: 'rgb(var(--color-bg-muted-rgb) / <alpha-value>)',
          strong: 'rgb(var(--color-bg-surface-rgb) / <alpha-value>)',
          card: 'rgb(var(--color-bg-surface-rgb) / <alpha-value>)',
        },
        text: {
          primary: 'rgb(var(--color-fg-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--color-fg-secondary-rgb) / <alpha-value>)',
          muted: 'rgb(var(--color-fg-muted-rgb) / <alpha-value>)',
          inverse: 'rgb(var(--color-fg-inverse-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      minHeight: {
        screen: ['100vh', '100dvh'],
      },
      height: {
        screen: ['100vh', '100dvh'],
      },
    },
  },
  plugins: [],
}
