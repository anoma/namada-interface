/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
  },
};
