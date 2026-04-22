# Codex Live Lab

`Codex Live Lab` turns the presentation concept into a challenge-ready live website with two real APIs:

- `OpenAI Responses API` for product ideation and submission copy
- `GitHub REST API` for live repository proof

## Run locally

1. Copy `.env.example` to `.env`
2. Add your `OPENAI_API_KEY`
3. Optionally add `GITHUB_TOKEN` for higher GitHub rate limits
4. Run `npm install`
5. Run `npm run dev`

The Vite client runs on `http://localhost:5173` and proxies API requests to the Express server on `http://localhost:8787`.

## Build and serve

- `npm run build`
- `npm run start`

After a production build, the Express server will also serve the `dist` frontend.
