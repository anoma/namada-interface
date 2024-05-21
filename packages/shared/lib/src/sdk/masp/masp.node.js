const fs = require("node:fs");

function writeFileSync(path, ui8a) {
  fs.writeFileSync(path, Buffer.from(ui8a));
}

function readFileSync(path) {
  const buffer = fs.readFileSync(path).buffer;
  return buffer;
}

function renameSync(pathA, pathB) {
  fs.renameSync(pathA, pathB);
}

function unlinkSync(path) {
  fs.unlinkSync(path);
}

function existsSync(path) {
  return fs.existsSync(path);
}

module.exports = {
  writeFileSync,
  readFileSync,
  renameSync,
  unlinkSync,
  existsSync,
};
