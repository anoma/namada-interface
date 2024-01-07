const { spawn } = require("child_process");

const args = process.argv.filter((arg) => arg.match(/--\w+/));
const strippedArgs = new Set(args.map((arg) => arg.replace("--", "")));

const isRelease = strippedArgs.has("release");
const isMulticore = strippedArgs.has("multicore");
const mode = isRelease ? "release" : "development";
const multicore = isMulticore ? "on" : "off";
let profile = "--release";

console.log(`Building \"shared\" in ${mode} mode. Multicore is ${multicore}.`);

const features = [];
if (isMulticore) {
  features.push("multicore");
}
if (!isRelease) {
  features.push("dev");
  profile = "--dev";
}

spawn(
  "wasm-pack",
  [
    "build",
    `${__dirname}/../lib`,
    profile,
    `--target`,
    `web`,
    `--out-dir`,
    `${__dirname}/../src/shared`,
    `--`,
    features.length > 0 ? ["--features", features.join(",")].flat() : [],
    isMulticore ? [`-Z`, `build-std=panic_abort,std`] : [],
  ].flat(),
  {
    stdio: "inherit",
    ...(isMulticore && {
      env: {
        ...process.env,
        RUSTFLAGS: "-C target-feature=+atomics,+bulk-memory,+mutable-globals",
      },
    }),
  }
);
