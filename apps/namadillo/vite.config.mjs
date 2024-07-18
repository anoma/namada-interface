/* eslint-disable */
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const filteredEnv = Object.keys(env).reduce((acc, current) => {
    if (current.startsWith("NAMADA_INTERFACE_")) {
      return {
        ...acc,
        [current]: env[current],
      };
    }
    return acc;
  }, {});

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      nodePolyfills({
        protocolImports: true,
      }),
      checker({
        typescript: true,
        eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
      }),
    ],
    define: {
      "process.env": filteredEnv,
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis",
        },
      },
    },
    build: {
      commonjsOptions: { transformMixedEsModules: true }, // Change
    },
  };
});
