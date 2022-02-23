import fs from "fs-extra"
import type { Manifest } from "webextension-polyfill"
import type PkgType from "../package.json"
import { isDev, port, r } from "../scripts/utils"

export async function getManifest() {
  const pkg = await fs.readJSON(r("package.json")) as typeof PkgType

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 2,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    browser_action: {
      default_icon: "./assets/favicon-32x32.png",
      default_popup: "./dist/popup/index.html"
    },
    options_ui: {
      page: "./dist/options/index.html",
      open_in_tab: true,
      chrome_style: false
    },
    background: {
      page: "./dist/background/index.html",
      persistent: false
    },
    icons: {
      16: "./assets/favicon-16x16.png",
      32: "./assets/favicon-32x32.png"
    },
    permissions: [
      "tabs",
      "storage",
      "activeTab",
      "unlimitedStorage",
      "http://*/",
      "https://*/"
    ],
    content_scripts: [{
      matches: ["http://*/*", "https://*/*"],
      js: ["./dist/contentScripts/index.global.js"]
    }],
    web_accessible_resources: [
    ],
    content_security_policy: "script-src \'self\' \'wasm-eval\' \'unsafe-eval\'; object-src \'self\'"
  }

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push("webNavigation")

    // this is required on dev for Vite script to load
    manifest.content_security_policy = `script-src \'self\' http://localhost:${port} \'wasm-eval\' \'unsafe-eval\'; object-src \'self\'`
  }

  return manifest
}
