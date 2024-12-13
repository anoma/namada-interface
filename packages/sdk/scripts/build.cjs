const { spawnSync } = require("child_process");

/**
 * TODO: Is this file no longer needed? I think it can be removed once build.js is updated!
 */
const args = process.argv.filter((arg) => arg.match(/--\w+/));
const strippedArgs = new Set(args.map((arg) => arg.replace("--", "")));

const isRelease = strippedArgs.has("release");
const isMulticore = strippedArgs.has("multicore");
const isNode = strippedArgs.has("node");
const taskSdk = `wasm:build${isNode ? ":node" : ""}${!isRelease ? ":dev" : ""
  }${isMulticore ? ":multicore" : ""}`;

spawnSync("yarn", ["workspace", "@namada/sdk", "run", taskSdk], {
  stdio: "inherit",
});
