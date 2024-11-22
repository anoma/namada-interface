import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "../../tsconfig.base.json";

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: "../../node_modules/ts-jest-mock-import-meta",
              options: {
                metaObjectReplacement: { env: {} },
              },
            },
          ],
        },
      },
    ],
  },
  roots: ["src"],
  displayName: "Namadillo",
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["e2e-tests"],
  moduleDirectories: ["src", "node_modules"],
  verbose: true,
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: "<rootDir>/src/",
    }),
    "^.+\\.svg$": "jest-transformer-svg",
    "\\.css": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
};
