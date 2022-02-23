const tailwindConfig = require('samba-whiskey/tailwind.config')

module.exports = {
  plugins: {
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
}
