import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16161d",
        paper: "#fbfaf8",
        accent: "#0d7a5f",
      },
    },
  },
  plugins: [],
};

export default config;
