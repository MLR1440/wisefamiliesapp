import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        aipurple: {
          DEFAULT: "hsl(258 90% 66%)",
          light: "hsl(258 90% 75%)",
        },
        green: {
          50: "hsl(120 30% 95%)",
          100: "hsl(120 25% 90%)",
          200: "hsl(140 30% 80%)",
          300: "hsl(140 35% 65%)",
          400: "hsl(140 35% 45%)", /* #4c9360 */
          500: "hsl(100 40% 47%)", /* #74a34c */
          600: "hsl(90 50% 35%)",  /* #51822e */
          700: "hsl(120 80% 15%)",
          800: "hsl(120 100% 10%)", /* #003400 */
          900: "hsl(120 100% 6%)",
        },
        gold: {
          50: "hsl(40 80% 95%)",
          100: "hsl(40 85% 90%)",
          200: "hsl(40 87% 80%)",
          300: "hsl(40 87% 70%)",
          400: "hsl(40 87% 60%)", /* #f2ba3f */
          500: "hsl(35 85% 55%)",
          600: "hsl(30 80% 50%)",
        },
        cream: {
          50: "hsl(43 47% 97%)",
          100: "hsl(43 47% 94%)", /* #f9f4e7 */
          200: "hsl(43 40% 90%)",
          300: "hsl(43 35% 85%)",
        },
        orange: {
          50: "hsl(30 85% 95%)",
          100: "hsl(30 85% 90%)",
          200: "hsl(30 85% 80%)",
          300: "hsl(30 85% 65%)", /* #f2a65a */
          400: "hsl(30 80% 55%)",
          500: "hsl(30 75% 45%)",
        },
        coral: {
          50: "hsl(10 70% 95%)",
          100: "hsl(10 70% 90%)",
          200: "hsl(10 70% 80%)",
          300: "hsl(10 70% 70%)",
          400: "hsl(10 70% 63%)", /* #e27d60 */
          500: "hsl(10 65% 55%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
