import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Helper: wraps a CSS variable so Tailwind can inject the alpha channel.
// This is required for opacity modifiers like bg-primary/50 to work correctly.
const v = (variable: string) =>
  `hsl(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],

  content: ["./src/**/*.{ts,tsx}"],

  theme: {
    extend: {
      colors: {
        // ── Surfaces ──────────────────────────────────────────────
        background:  v("--background"),
        foreground:  v("--foreground"),
        border:      v("--border"),
        input:       v("--input"),
        ring:        v("--ring"),

        // ── Card / Popover ────────────────────────────────────────
        card: {
          DEFAULT:    v("--card"),
          foreground: v("--card-foreground"),
        },
        popover: {
          DEFAULT:    v("--popover"),
          foreground: v("--popover-foreground"),
        },

        // ── Muted ─────────────────────────────────────────────────
        muted: {
          DEFAULT:    v("--muted"),
          foreground: v("--muted-foreground"),
        },

        // ── Primary — full scale ──────────────────────────────────
        primary: {
          DEFAULT:    v("--primary"),
          foreground: v("--primary-foreground"),
          50:  v("--primary-50"),
          100: v("--primary-100"),
          200: v("--primary-200"),
          300: v("--primary-300"),
          400: v("--primary-400"),
          500: v("--primary-500"),
          600: v("--primary-600"),
          700: v("--primary-700"),
          800: v("--primary-800"),
          900: v("--primary-900"),
          950: v("--primary-950"),
        },

        // ── Accent — full scale ───────────────────────────────────
        accent: {
          DEFAULT:    v("--accent"),
          foreground: v("--accent-foreground"),
          50:  v("--accent-50"),
          100: v("--accent-100"),
          200: v("--accent-200"),
          300: v("--accent-300"),
          400: v("--accent-400"),
          500: v("--accent-500"),
          600: v("--accent-600"),
          700: v("--accent-700"),
          800: v("--accent-800"),
          900: v("--accent-900"),
          950: v("--accent-950"),
        },

        // ── Secondary ─────────────────────────────────────────────
        secondary: {
          DEFAULT:    v("--secondary"),
          foreground: v("--secondary-foreground"),
        },

        // ── Destructive — full scale ──────────────────────────────
        destructive: {
          DEFAULT:    v("--destructive"),
          foreground: v("--destructive-foreground"),
          50:  v("--destructive-50"),
          100: v("--destructive-100"),
          200: v("--destructive-200"),
          300: v("--destructive-300"),
          400: v("--destructive-400"),
          500: v("--destructive-500"),
          600: v("--destructive-600"),
          700: v("--destructive-700"),
          800: v("--destructive-800"),
          900: v("--destructive-900"),
          950: v("--destructive-950"),
        },

        // ── Success ───────────────────────────────────────────────
        success: {
          DEFAULT:    v("--success"),
          foreground: v("--success-foreground"),
          50:  v("--success-50"),
          500: v("--success-500"),
          900: v("--success-900"),
        },
      },

      // ── Border Radius ─────────────────────────────────────────
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
    },
  },

  plugins: [tailwindcssAnimate],
};

export default config;