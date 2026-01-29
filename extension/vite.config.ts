import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";
import type { Plugin } from "vite";

function copyStaticAssets(): Plugin {
  return {
    name: "copy-static-assets",
    writeBundle() {
      const dist = resolve(__dirname, "dist");
      mkdirSync(dist, { recursive: true });
      copyFileSync(resolve(__dirname, "src/manifest.json"), resolve(dist, "manifest.json"));
      copyFileSync(resolve(__dirname, "src/popup/popup.html"), resolve(dist, "popup.html"));
      copyFileSync(resolve(__dirname, "src/popup/popup.css"), resolve(dist, "popup.css"));
    },
  };
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        "service-worker": resolve(__dirname, "src/background/service-worker.ts"),
        content: resolve(__dirname, "src/content/content.ts"),
        popup: resolve(__dirname, "src/popup/popup.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        format: "es",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [copyStaticAssets()],
});
