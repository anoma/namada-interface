/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/components/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("@namada/components/src/theme.js")],
  theme: {
    extend: {
      keyframes: {
        niceSpin: {
          "0%": { transform: "rotateZ(0)" },
          "25%, 90%": { transform: "rotateZ(180deg)" },
          "100%": { transform: "rotateZ(360deg)" },
        },

        loading: {
          from: {
            transform: "rotate(0turn)",
          },
          to: {
            transform: "rotate(1turn)",
          },
        },
      },
      animation: {
        niceSpin: "niceSpin 1s ease-out infinite 1s",
        loadingSpinner: "loading 1s ease infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
