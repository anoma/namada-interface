const { parseArgs } = require("node:util");
const { spawnSync, execSync } = require("child_process");

const targets = ["web", "nodejs"];

const argsOptions = {
  target: {
    type: "string",
    short: "t",
  },
  multicore: {
    type: "boolean",
    short: "m",
  },
  release: {
    type: "boolean",
    short: "r",
  },
};
const {
  multicore,
  release,
  target: maybeTarget,
} = parseArgs({
  args: process.argv.slice(2),
  options: argsOptions,
}).values;

const mode = release ? "release" : "development";
const multicoreLabel = multicore ? "on" : "off";
const target = targets.includes(maybeTarget) ? maybeTarget : "web";

execSync("rm -rf dist");
execSync("rm -rf src/wasm");

console.log(
  `Building \"SDK\" in ${mode} mode for ${target} target. Multicore is ${multicoreLabel}.`
);

const features = [target];
let profile = "--release";

if (multicore) {
  features.push("multicore");
}
if (!release) {
  features.push("dev");
  profile = "--dev";
}

const outDir = `${__dirname}/../src/wasm`;

execSync(`rm -rf ${outDir}}`);
const { status, stderr, pid } = spawnSync(
  "wasm-pack",
  [
    "build",
    `${__dirname}/../lib`,
    profile,
    `--target`,
    target,
    `--out-dir`,
    outDir,
    `--`,
    ["--features", features.join(",")].flat(),
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
  console.error("EXIT");
  process.exit(status);
}

execSync("rm -rf dist && mkdir dist && mkdir dist/wasm");

// Remove the .gitignore so we can publish generated files
execSync(`rm -rf ${outDir}.gitignore`);

// Manually copy wasms to dist
execSync(`cp -r ${outDir}/*.wasm ${__dirname}/../dist/wasm`);
