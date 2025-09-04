import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Arahkan ke folder client karena index.html ada di sana
  root: path.resolve(__dirname, "client"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@assets": path.resolve(__dirname, "client/src/assets"),
      "@components": path.resolve(__dirname, "client/src/components"),
    },
  },
  build: {
    // Output build YAML akan di folder root/dist
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
