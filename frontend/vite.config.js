import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  cacheDir: ".vite-cache",

  server: {
    port: 5173,
    host: true, // needed for Docker
    proxy: {
      // Any request to /api is forwarded to the Go backend
      // This means in dev you never deal with CORS issues
      "/api": {
        target:       "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir:    "dist",
    sourcemap: true,
  },
});
