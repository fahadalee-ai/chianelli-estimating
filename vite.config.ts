import { copyFileSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const previewFile = path.resolve("preview.html");
copyFileSync(previewFile, path.resolve("public/preview.html"));

function previewPagePlugin(): Plugin {
  const handle: Connect.NextHandleFunction = (req, res, next) => {
    const url = (req.url ?? "").split("?")[0];
    if (url !== "/preview.html") return next();
    res.statusCode = 200;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(readFileSync(previewFile));
  };
  const install = (middlewares: Connect.Server) => {
    middlewares.stack.unshift({ route: "", handle });
  };
  return {
    name: "preview-html",
    enforce: "pre",
    configureServer(server) {
      install(server.middlewares);
    },
    configurePreviewServer(server) {
      install(server.middlewares);
    },
  };
}

export default defineConfig({
  nitro: { preset: "vercel" },
  plugins: [previewPagePlugin()],
  vite: {
    server: {
      allowedHosts: ["localhost", "127.0.0.1", ".vercel.app"],
    },
    preview: {
      allowedHosts: ["localhost", "127.0.0.1", ".vercel.app"],
    },
  },
});
