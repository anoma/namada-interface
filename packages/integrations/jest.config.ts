import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions as rootCompilerOptions } from "../../tsconfig.base.json";

const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  moduleNameMapper: pathsToModuleNameMapper(rootCompilerOptions.paths, {
    prefix: "<rootDir>/src",
  }),
};

export default config;
