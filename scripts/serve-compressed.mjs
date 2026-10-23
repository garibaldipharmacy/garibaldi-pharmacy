#!/usr/bin/env node
// Serves the production build with gzip, the way the live site is served, so
// Lighthouse measures what visitors actually download.
//
//   npm run build && node scripts/serve-compressed.mjs
//
// The Nitro server doesn't compress responses itself; in production that's
// the job of the reverse proxy in front of it. Without compression the HTML is
// several times larger and Lighthouse reports a slower page than real visitors
// get. Listens on PORT (default 3000) and runs the app on the port above it.

import { spawn } from "node:child_process";
import http from "node:http";
import zlib from "node:zlib";

const port = Number(process.env.PORT || 3000);
const appPort = port + 1;
const compressible = /text|javascript|json|svg|xml|css/;

const app = spawn(process.execPath, [".output/server/index.mjs"], {
  env: { ...process.env, PORT: String(appPort), HOST: "127.0.0.1" },
  stdio: "inherit",
});
app.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGTERM", () => app.kill("SIGTERM"));
process.on("SIGINT", () => app.kill("SIGINT"));

// Only start listening once the app answers, so whatever waits for the ready
// message below never gets a 502 from an app that is still booting
async function waitForApp() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const up = await new Promise((resolve) => {
      http
        .get({ host: "127.0.0.1", port: appPort, path: "/" }, (res) => {
          res.resume();
          resolve(true);
        })
        .on("error", () => resolve(false));
    });
    if (up) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  console.error(`App did not start on port ${appPort}`);
  process.exit(1);
}

await waitForApp();

http
  .createServer((req, res) => {
    const upstream = http.request(
      {
        host: "127.0.0.1",
        port: appPort,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, "accept-encoding": "identity" },
      },
      (up) => {
        const headers = { ...up.headers };
        const gzip =
          compressible.test(headers["content-type"] || "") &&
          /gzip/.test(req.headers["accept-encoding"] || "");

        if (gzip) {
          delete headers["content-length"];
          headers["content-encoding"] = "gzip";
        }
        res.writeHead(up.statusCode, headers);
        (gzip ? up.pipe(zlib.createGzip()) : up).pipe(res);
      }
    );
    upstream.on("error", () => {
      res.writeHead(502);
      res.end();
    });
    req.pipe(upstream);
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Serving compressed on http://127.0.0.1:${port}`);
  });
