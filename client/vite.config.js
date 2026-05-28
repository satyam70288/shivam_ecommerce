import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { cspHeaderValue, cspMetaContent } from "./csp.config.js";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const csp = cspHeaderValue(isDev, env);

  return {
    plugins: [
      react(),
      {
        name: "inject-csp-meta-production",
        transformIndexHtml(html) {
          if (isDev) return html;
          const content = cspMetaContent(false, env);
          if (html.includes('http-equiv="Content-Security-Policy"')) return html;
          return html.replace(
            "<head>",
            `<head>\n    <meta http-equiv="Content-Security-Policy" content="${content}" />`
          );
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      headers: {
        "Content-Security-Policy": csp,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    preview: {
      headers: {
        "Content-Security-Policy": cspHeaderValue(false, env),
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
  };
});
