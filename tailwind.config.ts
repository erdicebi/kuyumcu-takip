import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        gold: {
          50: "#fbf8ef",
          100: "#f4edd5",
          200: "#e9d9aa",
          300: "#dcc076",
          400: "#d0a64a",
          500: "#b98b31",
          600: "#997027",
          700: "#795522",
          800: "#654720",
          900: "#563d1f"
        }
      },
      boxShadow: {
        apple: "0 1px 2px rgba(0,0,0,.04), 0 10px 36px rgba(24,24,27,.06)",
        float: "0 18px 60px rgba(0,0,0,.12)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
