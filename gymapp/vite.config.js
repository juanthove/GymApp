import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), basicSsl()],
  server: {
    proxy: {
      "/api": "http://localhost:8080"
    }
  },
})
