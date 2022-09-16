import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  // verbose: true,
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
  },
  // testEnvironment: "node",
  // moduleDirectories: ["/src"],
};

export default config;
