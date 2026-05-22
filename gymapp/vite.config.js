import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    basicSsl(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons.svg", "icon-192.png", "icon-512.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024
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
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons.svg",
            sizes: "any",
            type: "image/svg+xml"
          },
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/api": "http://localhost:8080"
    }
  },
})
