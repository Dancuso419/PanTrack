import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Build into the server folder so Express serves it from inside its own dir
  // (../public relative to server/dist) — no fragile cross-package path at runtime.
  build: {
    outDir: "../server/public",
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
