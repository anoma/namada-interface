import { createDefaultPreset, pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "../../tsconfig.base.json";

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...createDefaultPreset(),
  roots: ["src"],
  displayName: "Namadillo",
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["e2e-tests"],
  moduleDirectories: ["src", "node_modules"],
  verbose: true,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/src/",
  }),
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
