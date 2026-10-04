import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/lammps-automation/",

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 8443,
    host: true,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});