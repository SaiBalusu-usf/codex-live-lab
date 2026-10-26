import { requireAppAccess, type AccessRequest } from '../../server/access.js';
import { getRepoPulse } from "../../server/core.js";

type QueryValue = string | string[] | undefined;

type ApiRequest = AccessRequest & {
  method?: string;
  query?: Record<string, QueryValue>;
};

type ApiResponse = {
  json(body: unknown): void;
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
};

function readQueryUrl(value: QueryValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (!requireAppAccess(request, response)) return;
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const repoPulse = await getRepoPulse(readQueryUrl(request.query?.url));
    response.status(200).json(repoPulse);
  } catch {
    response.status(400).json({
      error: "GitHub data could not be loaded.",
    });
  }
}
