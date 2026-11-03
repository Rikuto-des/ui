import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Workspace packages ship TypeScript source; let Vite transform them.
  optimizeDeps: { exclude: ["@urushi/react", "@urushi/core"] },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        components: resolve(import.meta.dirname, "components.html"),
      },
    },
  },
});
