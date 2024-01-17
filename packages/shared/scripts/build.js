const { parseArgs } = require("node:util");
const { spawnSync, exec } = require("child_process");

const argsOptions = {
  multicore: {
    type: "boolean",
    short: "m",
  },
  release: {
    type: "boolean",
    short: "r",
  },
  outDir: {
    type: "string",
    short: "o",
  },
};
const {
  multicore,
  release,
  outDir = "/../src/shared",
} = parseArgs({
  args: process.argv.slice(2),
  options: argsOptions,
}).values;

const mode = release ? "release" : "development";
const multicoreLabel = multicore ? "on" : "off";

console.log(
  `Building \"shared\" in ${mode} mode. Multicore is ${multicoreLabel}.`
);

const features = [];
let profile = "--release";

if (multicore) {
  features.push("multicore");
}
if (!release) {
  features.push("dev");
  profile = "--dev";
}

const { status } = spawnSync(
  "wasm-pack",
  [
    "build",
    `${__dirname}/../lib`,
    profile,
    `--target`,
    `web`,
    `--out-dir`,
    `${__dirname}${outDir}`,
    `--`,
    features.length > 0 ? ["--features", features.join(",")].flat() : [],
    multicore ? [`-Z`, `build-std=panic_abort,std`] : [],
  ].flat(),
  {
    stdio: "inherit",
    ...(multicore && {
      env: {
        ...process.env,
        RUSTFLAGS: "-C target-feature=+atomics,+bulk-memory,+mutable-globals",
      },
    }),
  }
);

if (status !== 0) {
  process.exit(status);
}

// Remove the .gitignore so we can publish generated files
exec(`rm -rf ${__dirname}${outDir}/.gitignore`);
