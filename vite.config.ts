import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "UI5WebComponentsHA",
      formats: ["es"],
      fileName: () => "ui5-webcomponents-ha.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
    minify: "terser",
    sourcemap: false,
  },
});
