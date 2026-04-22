import { z } from "zod";

export const openaiModel = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
const githubToken = process.env.GITHUB_TOKEN?.trim();

export const repoQuerySchema = z.object({
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

export function getHealthPayload() {
  return {
    githubTokenConfigured: Boolean(githubToken),
    model: openaiModel,
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    serverTime: new Date().toISOString(),
  };
}

export async function getRepoPulse(rawUrl: unknown) {
  const query = repoQuerySchema.parse({
    url: typeof rawUrl === "string" ? rawUrl : "",
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

  return {
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
  };
}
