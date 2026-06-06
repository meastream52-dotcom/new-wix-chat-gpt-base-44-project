import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8edf5",
          100: "#c5d2e8",
          200: "#9fb4d8",
          300: "#7896c8",
          400: "#5a7dbb",
          500: "#3d65ae",
          600: "#2e52a0",
          700: "#1d3d8e",
          800: "#0f2b74",
          900: "#0A2744",
          950: "#061529",
        },
        ocean: {
          500: "#1565C0",
          600: "#1158b0",
          700: "#0c479a",
        },
        gold: {
          400: "#fbbf24",
          500: "#F59E0B",
          600: "#d97706",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
