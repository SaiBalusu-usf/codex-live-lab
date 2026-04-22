import { getHealthPayload } from "../server/core";

type ApiResponse = {
  json(body: unknown): void;
  status(code: number): ApiResponse;
};

export default function handler(_request: unknown, response: ApiResponse) {
  response.status(200).json(getHealthPayload());
}
