import { requireAppAccess, type AccessRequest } from '../server/access.js';
import { getHealthPayload } from "../server/core.js";

type ApiResponse = {
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
  status(code: number): ApiResponse;
};

export default function handler(request: AccessRequest, response: ApiResponse) {
  if (!requireAppAccess(request, response)) return;
  response.status(200).json(getHealthPayload());
}
