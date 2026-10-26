import { createHash, timingSafeEqual } from 'node:crypto';

export type AccessRequest = { method?: string; headers?: Record<string, string | string[] | undefined> };
type AccessResponse = { status(code: number): AccessResponse; json(body: unknown): unknown; setHeader(name: string, value: string): unknown };

export function createAccessGuard({ env = process.env, now = Date.now }: { env?: Record<string, string | undefined>; now?: () => number } = {}) {
  let calls: number[] = [];
  return (request: AccessRequest, response: AccessResponse): boolean => {
    response.setHeader('Cache-Control', 'no-store');
    const fail = (code: number, error: string) => { response.status(code).json({ error }); return false; };
    const username = env.APP_USERNAME;
    const password = env.APP_PASSWORD;
    const origin = env.APP_ORIGIN;
    if (!username || !password || password.length < 32 || !origin) return fail(503, 'Application access is not configured.');
    const headers = request.headers ?? {};
    const authorization = headers.authorization;
    const expected = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
    const digest = (value: string) => createHash('sha256').update(value).digest();
    if (typeof authorization !== 'string' || !timingSafeEqual(digest(authorization), digest(expected))) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Codex Live Lab", charset="UTF-8"');
      return fail(401, 'Authentication required.');
    }
    if ((headers.origin && headers.origin !== origin) ||
        (headers['sec-fetch-site'] && !['same-origin', 'none'].includes(String(headers['sec-fetch-site'])))) {
      return fail(403, 'Same-origin requests only.');
    }
    if (request.method === 'POST') {
      if (typeof headers['content-type'] !== 'string' || headers['content-type'].split(';')[0].trim() !== 'application/json') return fail(415, 'JSON required.');
      calls = calls.filter(timestamp => now() - timestamp < 60_000);
      if (calls.length >= 10) return fail(429, 'Try again later.');
      calls.push(now());
    }
    return true;
  };
}

export const requireAppAccess = createAccessGuard();
