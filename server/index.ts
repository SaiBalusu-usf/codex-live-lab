import "dotenv/config";

import { existsSync } from "node:fs";
import { resolve } from "node:path";

import express from "express";

import { app } from "./app";

const port = Number(process.env.PORT ?? 8787);

const distPath = resolve(process.cwd(), "dist");
const indexPath = resolve(distPath, "index.html");

if (existsSync(distPath) && existsSync(indexPath)) {
  app.use(express.static(distPath));

  app.get(/^\/(?!api).*/, (_request, response) => {
    response.sendFile(indexPath);
  });
}

app.listen(port, () => {
  // Intentional server log for local dev visibility.
  console.log(`Codex Live Lab server listening on http://localhost:${port}`);
});
