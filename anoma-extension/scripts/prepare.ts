// generate stub index.html files for dev entry
import { execSync } from "child_process"
import fs from "fs-extra"
import chokidar from "chokidar"
import path from "path"
import glob from "glob"

import { r, port, isDev, log } from "./utils"

/**
 * Stub index.html to use Vite in development
 */
const stubIndexHtml = async () => {
  const views = [
    "options",
    "popup",
    "background",
    "accountCreation"
  ]

  for (const view of views) {
    await fs.ensureDir(r(`extension/dist/${view}`))
    let data = await fs.readFile(r(`src/${view}/index.html`), "utf-8")
    data = data
      .replace("\"./main.ts\"", `"http://localhost:${port}/${view}/main.ts"`)
      // Enables React Fast Refresh in dev mode
      .replace("<!-- Placeholder for React Fast Refresh -->", `<script type="module" src="http://localhost:${port}/loadReactRefresh.js"></script>`)
      .replace("\"./PopupMain.bs.js\"", `"http://localhost:${port}/${view}/PopupMain.bs.js"`)
      .replace("\"./OptionsMain.bs.js\"", `"http://localhost:${port}/${view}/OptionsMain.bs.js"`)
      .replace("\"./BackgroundMain.bs.js\"", `"http://localhost:${port}/${view}/BackgroundMain.bs.js"`)
      .replace("\"./AccountCreationMain.bs.js\"", `"http://localhost:${port}/${view}/AccountCreationMain.bs.js"`)
      .replace("<div id=\"app\"></div>", "<div id=\"app\">Vite server did not start</div>")
    await fs.writeFile(r(`extension/dist/${view}/index.html`), data, "utf-8")
    log("PRE", `stub ${view}`)
  }
}

const writeManifest = () => {
  execSync("npx esno ./scripts/manifest.ts", { stdio: "inherit" })
}

writeManifest()

if (isDev) {
  stubIndexHtml()
  chokidar.watch(r("src/**/*.html"))
    .on("change", () => {
      stubIndexHtml()
    })
  chokidar.watch([r("src/manifest.ts"), r("package.json")])
    .on("change", () => {
      writeManifest()
    })
}

if (!isDev) {
  glob("extension/dist/**/*.wasm", {}, (_error, files) => {
    files.forEach(file => {
      fs.moveSync(file, `extension/assets/${path.basename(file)}`, { overwrite: true })
    })
  })
}
