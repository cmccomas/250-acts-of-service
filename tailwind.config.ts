import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        ivory: "#faf8f5",
        charcoal: "#2c2c2c",
        forest: {
          50: "#f0f7f2",
          100: "#dceede",
          200: "#b5dbbf",
          300: "#7fc294",
          400: "#4da76b",
          500: "#2d8a4e",
          600: "#1a6b38",
          700: "#1a4d2e",
          800: "#153d25",
          900: "#12321f",
        },
        gold: {
          50: "#fdf9ef",
          100: "#faf0d2",
          200: "#f4dfa4",
          300: "#edc96d",
          400: "#e6b33e",
          500: "#d4a017",
          600: "#b8860b",
          700: "#96670e",
          800: "#7a5213",
          900: "#654315",
        },
      },
    },
  },
  plugins: [],
};
export default config;
