import { defineConfig, UserConfig } from "vite"
import AutoImport from "unplugin-auto-import/vite"
import React from "@vitejs/plugin-react"
import { r, port, isDev } from "./scripts/utils"

export const sharedConfig: UserConfig = {
  root: r("src"),
  resolve: {
    alias: {
      "~/": `${r("src")}/`
    }
  },
  define: {
    __DEV__: isDev
  },
  plugins: [
    React({
      exclude: ["**/*Main.bs.js", "bindings/Storage.bs.js"]
    }),

    AutoImport({
      imports: [
        {
          "webextension-polyfill": [
            ["default", "browser"]
          ]
        }
      ]
    }),

    // rewrite assets to use relative path
    {
      name: "assets-rewrite",
      enforce: "post",
      apply: "build",
      transformIndexHtml(html) {
        return html.replace(/"\/assets\//g, "\"../assets/")
      }
    }
  ],
  optimizeDeps: {
    exclude: ["anoma", "samba-whiskey"]
  }
}

export default defineConfig(({ command }) => ({
  ...sharedConfig,
  base: command === "serve" ? `http://localhost:${port}/` : undefined,
  server: {
    port,
    hmr: {
      host: "localhost",
      protocol: "ws"
    }
  },
  build: {
    outDir: r("extension/dist"),
    emptyOutDir: false,
    // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
    terserOptions: {
      mangle: false
    },
    rollupOptions: {
      input: {
        background: r("src/background/index.html"),
        options: r("src/options/index.html"),
        popup: r("src/popup/index.html"),
        accountCreation: r("src/accountCreation/index.html")
      }
    }
  },
  plugins: [
    ...sharedConfig.plugins!
  ]
}))
