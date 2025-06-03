import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: '.', // Explicitly set root to current dir (client/)
  build: {
    outDir: '../dist/client', // Output relative to client/ dir
    emptyOutDir: true,
  },
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'client/src') }, // This will resolve to root/client/src
      { find: '@shared', replacement: path.resolve(__dirname, 'shared') },       // This will resolve to root/shared
      { find: '@assets', replacement: path.resolve(__dirname, 'attached_assets') } // This will resolve to root/attached_assets
    ],
  },
});
