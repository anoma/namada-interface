// vite.config.mjs
import react from "file:///Users/smagin07/Desktop/namada-work/namada-interface/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///Users/smagin07/Desktop/namada-work/namada-interface/node_modules/vite/dist/node/index.js";
import checker from "file:///Users/smagin07/Desktop/namada-work/namada-interface/apps/namadillo/node_modules/vite-plugin-checker/dist/esm/main.js";
import { nodePolyfills } from "file:///Users/smagin07/Desktop/namada-work/namada-interface/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { VitePWA } from "file:///Users/smagin07/Desktop/namada-work/namada-interface/node_modules/vite-plugin-pwa/dist/index.js";
import tsconfigPaths from "file:///Users/smagin07/Desktop/namada-work/namada-interface/node_modules/vite-tsconfig-paths/dist/index.js";
var vite_config_default = defineConfig(() => {
  return {
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "credentialless"
      }
    },
    plugins: [
      VitePWA({
        srcDir: "src",
        filename: "sw.ts",
        strategies: "injectManifest",
        injectRegister: false,
        manifest: false,
        injectManifest: {
          injectionPoint: void 0
        },
        devOptions: {
          enabled: true,
          type: "module"
        }
      }),
      react(),
      tsconfigPaths(),
      nodePolyfills({
        protocolImports: true
      }),
      checker({
        typescript: true,
        eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
        overlay: { initialIsOpen: false }
      })
    ],
    worker: {
      plugins: () => [tsconfigPaths()],
      format: "es"
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis"
        }
      }
    },
    build: {
      commonjsOptions: { transformMixedEsModules: true }
      // Change
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3NtYWdpbjA3L0Rlc2t0b3AvbmFtYWRhLXdvcmsvbmFtYWRhLWludGVyZmFjZS9hcHBzL25hbWFkaWxsb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3NtYWdpbjA3L0Rlc2t0b3AvbmFtYWRhLXdvcmsvbmFtYWRhLWludGVyZmFjZS9hcHBzL25hbWFkaWxsby92aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3NtYWdpbjA3L0Rlc2t0b3AvbmFtYWRhLXdvcmsvbmFtYWRhLWludGVyZmFjZS9hcHBzL25hbWFkaWxsby92aXRlLmNvbmZpZy5tanNcIjsvKiBlc2xpbnQtZGlzYWJsZSAqL1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBjaGVja2VyIGZyb20gXCJ2aXRlLXBsdWdpbi1jaGVja2VyXCI7XG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSBcInZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzXCI7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSBcInZpdGUtcGx1Z2luLXB3YVwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeVwiOiBcInNhbWUtb3JpZ2luXCIsXG4gICAgICAgIFwiQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeVwiOiBcImNyZWRlbnRpYWxsZXNzXCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgVml0ZVBXQSh7XG4gICAgICAgIHNyY0RpcjogXCJzcmNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwic3cudHNcIixcbiAgICAgICAgc3RyYXRlZ2llczogXCJpbmplY3RNYW5pZmVzdFwiLFxuICAgICAgICBpbmplY3RSZWdpc3RlcjogZmFsc2UsXG4gICAgICAgIG1hbmlmZXN0OiBmYWxzZSxcbiAgICAgICAgaW5qZWN0TWFuaWZlc3Q6IHtcbiAgICAgICAgICBpbmplY3Rpb25Qb2ludDogdW5kZWZpbmVkLFxuICAgICAgICB9LFxuICAgICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiBcIm1vZHVsZVwiLFxuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICByZWFjdCgpLFxuICAgICAgdHNjb25maWdQYXRocygpLFxuICAgICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAgY2hlY2tlcih7XG4gICAgICAgIHR5cGVzY3JpcHQ6IHRydWUsXG4gICAgICAgIGVzbGludDogeyBsaW50Q29tbWFuZDogJ2VzbGludCBcIi4vc3JjLyoqLyoue3RzLHRzeH1cIicgfSxcbiAgICAgICAgb3ZlcmxheTogeyBpbml0aWFsSXNPcGVuOiBmYWxzZSB9LFxuICAgICAgfSksXG4gICAgXSxcbiAgICB3b3JrZXI6IHtcbiAgICAgIHBsdWdpbnM6ICgpID0+IFt0c2NvbmZpZ1BhdGhzKCldLFxuICAgICAgZm9ybWF0OiBcImVzXCIsXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAgIC8vIE5vZGUuanMgZ2xvYmFsIHRvIGJyb3dzZXIgZ2xvYmFsVGhpc1xuICAgICAgICBkZWZpbmU6IHtcbiAgICAgICAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBjb21tb25qc09wdGlvbnM6IHsgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUgfSwgLy8gQ2hhbmdlXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLE9BQU8sV0FBVztBQUNsQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGFBQWE7QUFDcEIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sbUJBQW1CO0FBRTFCLElBQU8sc0JBQVEsYUFBYSxNQUFNO0FBQ2hDLFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQLDhCQUE4QjtBQUFBLFFBQzlCLGdDQUFnQztBQUFBLE1BQ2xDO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osZ0JBQWdCO0FBQUEsUUFDaEIsVUFBVTtBQUFBLFFBQ1YsZ0JBQWdCO0FBQUEsVUFDZCxnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLFFBQ0EsWUFBWTtBQUFBLFVBQ1YsU0FBUztBQUFBLFVBQ1QsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELE1BQU07QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLGNBQWM7QUFBQSxRQUNaLGlCQUFpQjtBQUFBLE1BQ25CLENBQUM7QUFBQSxNQUNELFFBQVE7QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLFFBQVEsRUFBRSxhQUFhLCtCQUErQjtBQUFBLFFBQ3RELFNBQVMsRUFBRSxlQUFlLE1BQU07QUFBQSxNQUNsQyxDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sU0FBUyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBQUEsTUFDL0IsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLGdCQUFnQjtBQUFBO0FBQUEsUUFFZCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsUUFDVjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxpQkFBaUIsRUFBRSx5QkFBeUIsS0FBSztBQUFBO0FBQUEsSUFDbkQ7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
