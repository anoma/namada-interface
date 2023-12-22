/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/components/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("@namada/components/src/theme.js")],
  theme: {
    extend: {},
  },
  plugins: [],
};
