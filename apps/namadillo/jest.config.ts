import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions as baseCompilerOptions } from "../../tsconfig.base.json";
import { compilerOptions } from "./tsconfig.json";

import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["e2e-tests"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(baseCompilerOptions.paths),
  moduleDirectories: ["node_modules", "src"],
};
export default config;
