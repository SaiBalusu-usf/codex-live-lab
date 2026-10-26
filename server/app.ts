import express from "express";
import { requireAppAccess } from './access.js';

import { createBlueprint, createSubmissionKit } from "./ai.js";
import {
  getHealthPayload,
  getRepoPulse,
} from "./core.js";

export const app = express();

app.use('/api', (request, response, next) => {
  if (requireAppAccess(request, response)) next();
});
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json(getHealthPayload());
});

app.post("/api/blueprint", async (request, response) => {
  try {
    const blueprint = await createBlueprint(request.body);
    response.json(blueprint);
  } catch {
    response.status(400).json({
      error: "The blueprint request could not be completed.",
    });
  }
});

app.post("/api/submission-kit", async (request, response) => {
  try {
    const submissionKit = await createSubmissionKit(request.body);
    response.json(submissionKit);
  } catch {
    response.status(400).json({
      error:
        "The submission kit request could not be completed.",
    });
  }
});

app.get("/api/github/repo", async (request, response) => {
  try {
    const repoPulse = await getRepoPulse(request.query.url);
    response.json(repoPulse);
  } catch {
    response.status(400).json({
      error: "GitHub data could not be loaded.",
    });
  }
});
