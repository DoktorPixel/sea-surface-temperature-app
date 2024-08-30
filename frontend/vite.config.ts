import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
});

