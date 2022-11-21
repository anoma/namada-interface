import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  preset: "ts-jest/presets/js-with-ts",
  moduleDirectories: ['node_modules', 'src'],
  transformIgnorePatterns: ["__mocks__"],
  setupFilesAfterEnv: ["./src/setupTests.ts"],
  testEnvironment: "jsdom"
};

export default config;
