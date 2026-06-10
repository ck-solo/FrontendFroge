import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: {
      origin: /^https?.\/\/(?:.+\.)?localhost(?::\d+)?$/,
    },
    proxy: {
      // Proxy /api/* to the backend server
      "/api": {
        target: "http://localhost",
        changeOrigin: true,
        secure: false,
      },
      // Proxy /agent/<sandboxId>/* to the agent host
      // e.g. /agent/019e.../list-files  →  http://019e....agent.lvh.me/list-files
      "/agent": {
        target: "http://localhost", // placeholder, overridden by router below
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // Extract sandboxId from path: /agent/<sandboxId>/...
            const match = req.url.match(/^\/agent\/([^/]+)(\/.*)?$/);
            if (match) {
              const sandboxId = match[1];
              proxyReq.setHeader("host", `${sandboxId}.agent.lvh.me`);
              proxyReq.path = match[2] || "/";
            }
          });
          proxy.on("proxyReqWs", (proxyReq, req) => {
            const match = req.url.match(/^\/agent\/([^/]+)(\/.*)?$/);
            if (match) {
              const sandboxId = match[1];
              proxyReq.setHeader("host", `${sandboxId}.agent.lvh.me`);
              proxyReq.path = match[2] || "/";
            }
          });
        },
        router: (req) => {
          console.log("Incoming URL:", req.url);

          const match = req.url.match(/^\/agent\/([^/]+)/);

          if (match) {
            console.log("Routing to:", `http://${match[1]}.agent.lvh.me`);
            return `http://${match[1]}.agent.lvh.me`;
          }

          return "http://localhost";
        },
      },
    },
  },
});
