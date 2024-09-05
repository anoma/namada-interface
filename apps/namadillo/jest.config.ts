import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ["e2e-tests"],
  moduleDirectories: ["node_modules", "src"],
};
export default config;
