import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/upload": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        headers: {
          "Cache-Control": "no-cache",
        },
      },
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    exclude: [...configDefaults.exclude, "e2e/*"],
  },
});

