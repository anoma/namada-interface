import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions as rootCompilerOptions } from "../../tsconfig.base.json";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  moduleDirectories: ["node_modules", "src"],
  transformIgnorePatterns: ["__mocks__"],

  moduleNameMapper: pathsToModuleNameMapper(rootCompilerOptions.paths, {
    prefix: "<rootDir>/src",
  }),
  setupFilesAfterEnv: ["./setupTests.ts"],
  testEnvironment: "jsdom",
};

export default config;
