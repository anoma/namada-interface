import { animation, colors, keyframes } from "./src/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/components/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("@namada/components/src/theme")],
  theme: {
    extend: {
      colors,
      keyframes,
      animation,
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
