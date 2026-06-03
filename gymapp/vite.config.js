import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";
import https from "https";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-1254.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      manifest: {
        id: "/",
        name: "GymPro",
        short_name: "GymPro",
        description: "GymPro training app",
        theme_color: "#0b132b",
        background_color: "#0b132b",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://gympro:8080",
        changeOrigin: true,
        secure: false,
      },
    },
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync("../certs/localhost+3-key.pem"),
      cert: fs.readFileSync("../certs/localhost+3.pem"),
    },
  },
});
