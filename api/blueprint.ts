import { requireAppAccess, type AccessRequest } from '../server/access.js';
import { createBlueprint } from "../server/ai.js";

type ApiRequest = AccessRequest & {
  body?: unknown;
  method?: string;
};

type ApiResponse = {
  json(body: unknown): void;
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (!requireAppAccess(request, response)) return;
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const blueprint = await createBlueprint(request.body);
    response.status(200).json(blueprint);
  } catch {
    response.status(400).json({
      error: "The blueprint request could not be completed.",
    });
  }
}
