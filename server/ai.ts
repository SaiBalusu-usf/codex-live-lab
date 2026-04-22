import OpenAI from "openai";
import { z } from "zod";

import { openaiModel } from "./core";

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
  const { zodTextFormat } = await import("openai/helpers/zod");

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

export async function createBlueprint(input: unknown) {
  const payload = blueprintRequestSchema.parse(input);
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

  return parseStructuredOutput(
    blueprintResponseSchema,
    "creator_challenge_blueprint",
    prompt,
  );
}

export async function createSubmissionKit(input: unknown) {
  const payload = submissionKitRequestSchema.parse(input);
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

  return parseStructuredOutput(
    submissionKitResponseSchema,
    "creator_challenge_submission_kit",
    prompt,
  );
}
