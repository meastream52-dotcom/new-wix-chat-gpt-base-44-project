import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          50: "#fdf6ef",
          100: "#f9e8d8",
          500: "#d97a3d",
          600: "#c4622a",
          700: "#a34d22",
          900: "#5c2c15",
        },
        ink: {
          50: "#f6f7f8",
          100: "#e8eaed",
          400: "#8b929c",
          600: "#4b515b",
          800: "#23272e",
          900: "#15181d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
