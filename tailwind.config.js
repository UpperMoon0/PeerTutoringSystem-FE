/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // Standard for shadcn/ui
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './pages/**/*.{ts,tsx}', // Common paths for pages
    './components/**/*.{ts,tsx}', // Common paths for components
    './app/**/*.{ts,tsx}', // Next.js app router
    './src/**/*.{ts,tsx}', // General src
  ],
  prefix: "", // Standard for shadcn/ui
  theme: {
    container: { // Standard for shadcn/ui
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          // foreground: "var(--destructive-foreground)", // Not defined in index.css, usually white/light
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Custom button theme colors
        'button-theme': {
          'text': 'var(--btn-primary-text-color)',
          'gradient-from': 'var(--btn-primary-gradient-color-from)',
          'gradient-to': 'var(--btn-primary-gradient-color-to)',
          'gradient-hover-from': 'var(--btn-primary-gradient-hover-color-from)',
          'gradient-hover-to': 'var(--btn-primary-gradient-hover-color-to)',
        }
      },
      borderRadius: { // Standard for shadcn/ui
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: { // Standard for shadcn/ui
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: { // Standard for shadcn/ui
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
