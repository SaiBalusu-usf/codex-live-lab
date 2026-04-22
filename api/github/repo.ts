import { getRepoPulse } from "../../server/core";

type QueryValue = string | string[] | undefined;

type ApiRequest = {
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
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const repoPulse = await getRepoPulse(readQueryUrl(request.query?.url));
    response.status(200).json(repoPulse);
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : "GitHub data could not be loaded.",
    });
  }
}
