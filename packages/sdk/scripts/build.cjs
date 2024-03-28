const { spawnSync } = require("child_process");

const args = process.argv.filter((arg) => arg.match(/--\w+/));
const strippedArgs = new Set(args.map((arg) => arg.replace("--", "")));

const isRelease = strippedArgs.has("release");
const isMulticore = strippedArgs.has("multicore");
const isNode = strippedArgs.has("node");
const taskShared = `wasm:build${isNode ? ":node" : ""}${
  !isRelease ? ":dev" : ""
}${isMulticore ? ":multicore" : ""}`;

const taskCrypto = `wasm:build${isNode ? ":node" : ""}${
  !isRelease ? ":dev" : ""
}`;

spawnSync("yarn", ["workspace", "@namada/crypto", "run", taskCrypto], {
  stdio: "inherit",
});

spawnSync("yarn", ["workspace", "@namada/shared", "run", taskShared], {
  stdio: "inherit",
});
