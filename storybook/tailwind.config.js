/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "../packages/components/src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  presets: [require("@namada/components/src/theme")],
  theme: {
    extend: {},
  },
  plugins: [],
};
