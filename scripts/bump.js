const { parseArgs } = require("node:util");
var fs = require("fs");

const argsOptions = {
  packages: {
    type: "string",
    short: "p",
    multiple: true,
  },
  target: {
    type: "string",
    short: "t",
  },
};

const { packages, target } = parseArgs({
  args: process.argv.slice(2),
  options: argsOptions,
}).values;

const targetObj = require(`../${target}/package.json`);

console.log(`Bumping local dependencies in ${target}...`);

for (const package of packages) {
  const { version } = require(`../packages/${package}/package.json`);

  targetObj.dependencies[`@namada/${package}`] = version;
  console.log(`@namada/${package} -> ${version}`);
}

const newTargetJSON = JSON.stringify(targetObj, null, 2);

fs.writeFileSync(
  `${__dirname}/../${target}/package.json`,
  newTargetJSON,
  "utf8"
);

console.log("All local dependencies bumped!");
