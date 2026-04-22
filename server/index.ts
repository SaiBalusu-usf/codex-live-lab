import "dotenv/config";

import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const openaiModel = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
const githubToken = process.env.GITHUB_TOKEN?.trim();
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const blueprintRequestSchema = z.object({
  audience: z.string().trim().min(3).max(160),
  brandVibe: z.string().trim().min(3).max(240),
  builderName: z.string().trim().min(2).max(80),
  desiredOutput: z.string().trim().min(8).max(320),
  edge: z.string().trim().min(3).max(200),
  magicInput: z.string().trim().min(8).max(320),
  painPoint: z.string().trim().min(8).max(320),
});

const blueprintResponseSchema = z.object({
  audiencePromise: z.string(),
  coreLoop: z.array(z.string()).min(3).max(4),
  demoSteps: z.array(z.string()).min(4).max(5),
  handshakeSummary: z.string(),
  homepageHook: z.string(),
  landingSections: z
    .array(
      z.object({
        detail: z.string(),
        title: z.string(),
      }),
    )
    .min(3)
    .max(4),
  launchChecklist: z.array(z.string()).min(5).max(6),
  oneLiner: z.string(),
  productName: z.string(),
  resumeBullet: z.string(),
  standoutFeatures: z
    .array(
      z.object({
        detail: z.string(),
        title: z.string(),
      }),
    )
    .min(3)
    .max(4),
});

const submissionKitRequestSchema = z.object({
  audience: z.string().trim().min(3).max(180),
  deploymentUrl: z.string().trim().max(240).optional().default(""),
  productName: z.string().trim().min(2).max(120),
  proofPoint: z.string().trim().min(6).max(240),
  repoUrl: z.string().trim().max(240).optional().default(""),
  standoutFeature: z.string().trim().min(6).max(320),
  transformation: z.string().trim().min(8).max(320),
});

const submissionKitResponseSchema = z.object({
  demoScript: z
    .array(
      z.object({
        line: z.string(),
        time: z.string(),
      }),
    )
    .length(4),
  handshakeDescription: z.string(),
  judgeHighlights: z.array(z.string()).length(4),
  pitch: z.string(),
  resumeBullet: z.string(),
  socialPost: z.string(),
  submissionTitle: z.string(),
});

const repoQuerySchema = z.object({
  url: z.string().trim().min(3).max(240),
});

type GitHubRepo = {
  default_branch: string;
  description: string | null;
  forks_count: number;
  full_name: string;
  homepage: string | null;
  html_url: string;
  language: string | null;
  license: { spdx_id: string | null; name: string | null } | null;
  open_issues_count: number;
  pushed_at: string;
  stargazers_count: number;
  updated_at: string;
  watchers_count: number;
};

type GitHubCommit = {
  commit: {
    author: { date: string; name: string };
    message: string;
  };
  html_url: string;
  sha: string;
};

app.use(express.json({ limit: "1mb" }));

function requireOpenAI(): OpenAI {
  if (!openai) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to your environment or .env file to use the idea lab and submission kit.",
    );
  }

  return openai;
}

async function parseStructuredOutput<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  schemaName: string,
  prompt: string,
): Promise<z.infer<TSchema>> {
  const client = requireOpenAI();

  const response = await client.responses.parse({
    model: openaiModel,
    input: [
      {
        role: "system",
        content:
          "You are an expert product strategist helping a student build a polished, challenge-ready live website. Prefer concrete language, visible outputs, and concise product framing over vague inspiration.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    reasoning: {
      effort: "low",
    },
    text: {
      format: zodTextFormat(schema, schemaName),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned no parsed output.");
  }

  return response.output_parsed;
}

function normalizeRepoInput(input: string): { owner: string; repo: string } {
  const trimmed = input.trim().replace(/\/+$/, "");

  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const parts = url.pathname.split("/").filter(Boolean);

    if (url.hostname !== "github.com" || parts.length < 2) {
      throw new Error();
    }

    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/i, ""),
    };
  } catch {
    const parts = trimmed.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return {
        owner: parts[parts.length - 2],
        repo: parts[parts.length - 1].replace(/\.git$/i, ""),
      };
    }
  }

  throw new Error("Enter a valid GitHub repository URL like https://github.com/owner/repo.");
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
      "User-Agent": "codex-live-lab",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

app.get("/api/health", (_request, response) => {
  response.json({
    githubTokenConfigured: Boolean(githubToken),
    model: openaiModel,
    openaiConfigured: Boolean(openai),
    serverTime: new Date().toISOString(),
  });
});

app.post("/api/blueprint", async (request, response) => {
  try {
    const payload = blueprintRequestSchema.parse(request.body);
    const prompt = `
Create a challenge-ready website concept for the Codex Creator Challenge.

Builder identity: ${payload.builderName}
Target audience: ${payload.audience}
Pain point: ${payload.painPoint}
Magic input: ${payload.magicInput}
Desired output: ${payload.desiredOutput}
Brand vibe: ${payload.brandVibe}
Unique edge: ${payload.edge}

Return a concept that:
- feels like a real product, not a generic AI wrapper
- can be demoed in under two minutes
- maps cleanly to a one-page website
- emphasizes visible transformation over backend complexity
- sounds strong for a Handshake or portfolio submission
- uses concise, confident language

Make the homepage hook sound like polished landing-page copy.
Make the demo steps specific enough for a real walkthrough.
Make the resume bullet read like an actual shipped project.
`;

    const blueprint = await parseStructuredOutput(
      blueprintResponseSchema,
      "creator_challenge_blueprint",
      prompt,
    );

    response.json(blueprint);
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "The blueprint request could not be completed.",
    });
  }
});

app.post("/api/submission-kit", async (request, response) => {
  try {
    const payload = submissionKitRequestSchema.parse(request.body);
    const prompt = `
Build a polished submission package for a Codex Creator Challenge project.

Product name: ${payload.productName}
Audience: ${payload.audience}
Transformation: ${payload.transformation}
Standout feature: ${payload.standoutFeature}
Proof point to emphasize: ${payload.proofPoint}
Repository URL: ${payload.repoUrl || "Not provided yet"}
Deployment URL: ${payload.deploymentUrl || "Not provided yet"}

Requirements:
- Write like a strong student founder or early-career builder.
- Keep the pitch specific and portfolio-worthy.
- Demo script must have exactly four beats and sound natural out loud.
- Judge highlights should be quick, memorable proof points.
- The resume bullet should start with a strong action verb.
- The Handshake description should sound polished but not inflated.
- The social post should feel like a real launch note, not corporate marketing.
`;

    const submissionKit = await parseStructuredOutput(
      submissionKitResponseSchema,
      "creator_challenge_submission_kit",
      prompt,
    );

    response.json(submissionKit);
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "The submission kit request could not be completed.",
    });
  }
});

app.get("/api/github/repo", async (request, response) => {
  try {
    const query = repoQuerySchema.parse({
      url: typeof request.query.url === "string" ? request.query.url : "",
    });
    const { owner, repo } = normalizeRepoInput(query.url);

    const [repoData, languages, commits] = await Promise.all([
      fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`),
      fetchGitHub<Record<string, number>>(`/repos/${owner}/${repo}/languages`),
      fetchGitHub<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=5`),
    ]);

    const totalLanguageBytes = Object.values(languages).reduce(
      (sum, value) => sum + value,
      0,
    );

    response.json({
      languages: Object.entries(languages)
        .map(([name, value]) => ({
          name,
          percent: totalLanguageBytes
            ? Math.max(1, Math.round((value / totalLanguageBytes) * 100))
            : 0,
        }))
        .sort((left, right) => right.percent - left.percent),
      recentCommits: commits.map((commit) => ({
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        message: commit.commit.message.split("\n")[0],
        sha: commit.sha.slice(0, 7),
        url: commit.html_url,
      })),
      repo: {
        defaultBranch: repoData.default_branch,
        description: repoData.description ?? "",
        forksCount: repoData.forks_count,
        fullName: repoData.full_name,
        homepage: repoData.homepage ?? "",
        htmlUrl: repoData.html_url,
        license: repoData.license?.spdx_id ?? repoData.license?.name ?? "",
        openIssuesCount: repoData.open_issues_count,
        primaryLanguage: repoData.language ?? "",
        pushedAt: repoData.pushed_at,
        stars: repoData.stargazers_count,
        updatedAt: repoData.updated_at,
        watchers: repoData.watchers_count,
      },
    });
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "GitHub data could not be loaded.",
    });
  }
});

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
