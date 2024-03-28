const fs = require("node:fs");

export function writeFileSync(path, ui8a) {
  fs.writeFileSync(path, Buffer.from(ui8a));
}

export function readFileSync(path) {
  const buffer = fs.readFileSync(path).buffer;
  return buffer;
}

export function renameSync(pathA, pathB) {
  fs.renameSync(pathA, pathB);
}

export function unlinkSync(path) {
  fs.unlinkSync(path);
}

export function existsSync(path) {
  return fs.existsSync(path);
}
