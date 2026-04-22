import "./style.css";

type HealthResponse = {
  githubTokenConfigured: boolean;
  model: string;
  openaiConfigured: boolean;
  serverTime: string;
};

type HighlightCard = {
  detail: string;
  title: string;
};

type BlueprintResponse = {
  audiencePromise: string;
  coreLoop: string[];
  demoSteps: string[];
  handshakeSummary: string;
  homepageHook: string;
  landingSections: HighlightCard[];
  launchChecklist: string[];
  oneLiner: string;
  productName: string;
  resumeBullet: string;
  standoutFeatures: HighlightCard[];
};

type DemoBeat = {
  line: string;
  time: string;
};

type SubmissionKitResponse = {
  demoScript: DemoBeat[];
  handshakeDescription: string;
  judgeHighlights: string[];
  pitch: string;
  resumeBullet: string;
  socialPost: string;
  submissionTitle: string;
};

type RepoLanguage = {
  name: string;
  percent: number;
};

type RepoCommit = {
  author: string;
  date: string;
  message: string;
  sha: string;
  url: string;
};

type RepoResponse = {
  languages: RepoLanguage[];
  recentCommits: RepoCommit[];
  repo: {
    defaultBranch: string;
    description: string;
    forksCount: number;
    fullName: string;
    homepage: string;
    htmlUrl: string;
    license: string;
    openIssuesCount: number;
    primaryLanguage: string;
    pushedAt: string;
    stars: number;
    updatedAt: string;
    watchers: number;
  };
};

const timelineSteps = [
  {
    copy: "Anchor everything to one student pain point and one visible transformation.",
    label: "Frame",
  },
  {
    copy: "Use the idea lab to generate a tight product angle, hero copy, and a demoable build loop.",
    label: "Prompt",
  },
  {
    copy: "Turn the generated concept into a real repo, wire APIs, and keep the first version intentionally narrow.",
    label: "Build",
  },
  {
    copy: "Use GitHub proof plus the submission kit to show the result, not just the process.",
    label: "Prove",
  },
];

const storyCards = [
  {
    detail:
      "The presentation's best advice was to pick one transformation the audience can understand in seconds. The site keeps that as the main rule.",
    title: "One clear payoff",
  },
  {
    detail:
      "OpenAI generates the concept and submission language, while GitHub supplies live implementation proof so the story stays grounded.",
    title: "Real APIs, real proof",
  },
  {
    detail:
      "The whole product is scoped for a live demo: one page, one happy path, and no auth wall before the interesting part starts.",
    title: "Built for the challenge",
  },
];

const baseChecklist = [
  "Refine the idea until the input-to-output transformation feels obvious.",
  "Wire your live API keys and confirm the idea lab responds.",
  "Push your latest repo so GitHub proof reflects current work.",
  "Generate the submission kit and rehearse the four demo beats.",
  "Capture screenshots and a short walkthrough while the flow is stable.",
];

const targetDateStorageKey = "codex-live-lab.target-date";
const checklistStorageKey = "codex-live-lab.checklist";
const defaultTargetDate = "2026-04-30";
const numberFormatter = new Intl.NumberFormat("en-US");

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root not found.");
}

app.innerHTML = `
  <div class="site-shell">
    <div class="ambient ambient-one" aria-hidden="true"></div>
    <div class="ambient ambient-two" aria-hidden="true"></div>
    <div class="ambient ambient-three" aria-hidden="true"></div>

    <header class="topbar panel">
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true"></div>
        <div>
          <p class="eyebrow">Codex Creator Challenge</p>
          <h1 class="brand-title">Codex Live Lab</h1>
        </div>
      </div>
      <nav class="topnav" aria-label="Primary">
        <a href="#idea-lab">Idea lab</a>
        <a href="#submission-kit">Submission kit</a>
        <a href="#repo-pulse">Repo pulse</a>
        <a href="#launch-checklist">Checklist</a>
      </nav>
      <div class="status-stack">
        <div class="status-pill" id="apiStatusPill">Checking API status</div>
        <div class="status-pill soft" id="modelStatusPill">Waiting for server</div>
      </div>
    </header>

    <main class="page">
      <section class="hero panel">
        <div class="hero-copy">
          <div class="hero-heading">
            <p class="eyebrow accent">Deck to deployment</p>
            <h2>Make the challenge entry feel like a live Codex workspace instead of a slide deck on scroll.</h2>
            <p class="lede">
              The layout is rebuilt around one glassy app shell, clear panel boundaries, and stable side-by-side
              workspaces. OpenAI still drives the concept. GitHub still proves the shipping story. The page now stays
              composed while you move through it.
            </p>
          </div>

          <div class="hero-actions">
            <a class="button primary" href="#idea-lab">Generate the concept</a>
            <a class="button secondary" href="#repo-pulse">Show repo proof</a>
          </div>

          <div class="hero-metrics">
            <article class="metric-card">
              <p class="metric-label">Live stack</p>
              <p class="metric-value">OpenAI + GitHub</p>
              <p class="metric-note">Two production APIs wired into one challenge-ready story.</p>
            </article>
            <article class="metric-card">
              <p class="metric-label">Layout mode</p>
              <p class="metric-value">Glassy app shell</p>
              <p class="metric-note">One stable command bar and three workspace panels that scroll cleanly.</p>
            </article>
            <article class="metric-card">
              <p class="metric-label">Submission angle</p>
              <p class="metric-value">Idea, proof, pitch</p>
              <p class="metric-note">The exact arc the presentation was steering toward.</p>
            </article>
          </div>
        </div>

        <aside class="hero-side">
          <section class="hero-console">
            <div class="hero-console-head">
              <div>
                <p class="eyebrow">Challenge cockpit</p>
                <h3>One visible transformation, one polished loop</h3>
              </div>
              <div class="console-lights" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div class="timeline-grid">
              ${timelineSteps
                .map(
                  (step, index) => `
                    <article class="command-item">
                      <span class="timeline-number">0${index + 1}</span>
                      <div class="command-copy">
                        <h3>${step.label}</h3>
                        <p>${step.copy}</p>
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>

          <section class="deadline-card">
            <div class="section-chip alt">Target date</div>
            <label class="field-label" for="targetDate">Pick your challenge target</label>
            <input class="input" id="targetDate" type="date" />
            <div class="deadline-metric">
              <p class="deadline-value" id="countdownValue">--</p>
              <p class="deadline-caption" id="countdownCaption">until your current milestone</p>
            </div>
          </section>
        </aside>
      </section>

      <section class="section">
        <div class="section-heading section-heading-wide">
          <p class="eyebrow accent">Glassy system</p>
          <h2 class="section-title">Every major feature now lives inside its own panel, so the experience reads like one product surface from top to bottom.</h2>
          <p class="section-copy">
            The hero explains the value, the workspace panels handle the live interactions, and the checklist closes
            the loop for the final demo.
          </p>
        </div>

        <div class="story-grid">
          ${storyCards
            .map(
              (card) => `
                <article class="story-card panel">
                  <h3>${card.title}</h3>
                  <p>${card.detail}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="studio-stack">
        <article class="studio-panel panel" id="idea-lab">
          <div class="studio-head">
            <div class="section-heading">
              <p class="eyebrow accent">Idea lab</p>
              <h2 class="section-title">Generate the product angle, homepage story, and demo flow with OpenAI.</h2>
              <p class="section-copy">
                Feed it the real user, pain point, and output you want. The response comes back as structured content
                you can use immediately for the site, demo, and submission.
              </p>
            </div>
            <div class="studio-meta" aria-label="Idea lab capabilities">
              <span class="mini-pill">OpenAI</span>
              <span class="mini-pill">Structured output</span>
              <span class="mini-pill">Landing copy</span>
            </div>
          </div>

          <div class="studio-grid">
            <div class="workspace-surface">
              <form class="workspace-form" id="ideaForm">
                <div class="field-grid two-up">
                  <label class="field">
                    <span class="field-label">Builder identity</span>
                    <input class="input" name="builderName" type="text" value="USF student builder" />
                  </label>
                  <label class="field">
                    <span class="field-label">Target audience</span>
                    <input class="input" name="audience" type="text" value="students balancing classes, work, and side projects" />
                  </label>
                </div>

                <div class="field-grid two-up">
                  <label class="field">
                    <span class="field-label">Pain point</span>
                    <textarea class="textarea" name="painPoint" rows="4">I need a challenge idea that feels real, demos fast, and turns into something portfolio-worthy.</textarea>
                  </label>
                  <label class="field">
                    <span class="field-label">Magic input</span>
                    <textarea class="textarea" name="magicInput" rows="4">A rough creator idea, a student workflow problem, or a messy project concept that needs structure.</textarea>
                  </label>
                </div>

                <div class="field-grid two-up">
                  <label class="field">
                    <span class="field-label">Desired output</span>
                    <textarea class="textarea" name="desiredOutput" rows="4">A clear product concept, homepage story, demo steps, and challenge-ready positioning.</textarea>
                  </label>
                  <label class="field">
                    <span class="field-label">Brand vibe</span>
                    <textarea class="textarea" name="brandVibe" rows="4">Bold, polished, friendly, and built by someone who actually ships.</textarea>
                  </label>
                </div>

                <label class="field">
                  <span class="field-label">Unique edge</span>
                  <input class="input" name="edge" type="text" value="Something a judge can understand in 20 seconds and remember later." />
                </label>

                <div class="form-actions">
                  <button class="button primary" type="submit" id="ideaSubmit">Generate blueprint</button>
                  <p class="inline-note" id="ideaStatus">OpenAI will return structured product content when your API key is configured.</p>
                </div>
              </form>
            </div>

            <div class="workspace-surface">
              <div class="result-shell" id="ideaResult">
                <div class="placeholder-card">
                  <p class="placeholder-kicker">Structured output</p>
                  <h3>Your concept blueprint will appear here.</h3>
                  <p>Use it to decide what the homepage says, what the demo shows first, and how to pitch the project on Handshake.</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="studio-panel panel" id="submission-kit">
          <div class="studio-head">
            <div class="section-heading">
              <p class="eyebrow accent">Submission kit</p>
              <h2 class="section-title">Convert the concept into a demo script, resume bullet, and polished submission language.</h2>
              <p class="section-copy">
                This is the proof layer from the presentation: the project needs a product story, not just code.
              </p>
            </div>
            <div class="studio-meta" aria-label="Submission kit capabilities">
              <span class="mini-pill">Demo beats</span>
              <span class="mini-pill">Resume bullet</span>
              <span class="mini-pill">Judge pitch</span>
            </div>
          </div>

          <div class="studio-grid">
            <div class="workspace-surface">
              <form class="workspace-form" id="kitForm">
                <div class="field-grid two-up">
                  <label class="field">
                    <span class="field-label">Product name</span>
                    <input class="input" id="kitProductName" name="productName" type="text" value="Codex Live Lab" />
                  </label>
                  <label class="field">
                    <span class="field-label">Audience</span>
                    <input class="input" id="kitAudience" name="audience" type="text" value="students and early creators who need a demoable project story fast" />
                  </label>
                </div>

                <div class="field-grid two-up">
                  <label class="field">
                    <span class="field-label">Transformation</span>
                    <textarea class="textarea" id="kitTransformation" name="transformation" rows="4">Turn a rough challenge idea into a product concept, a live demo plan, and a submission-ready narrative.</textarea>
                  </label>
                  <label class="field">
                    <span class="field-label">Standout proof point</span>
                    <textarea class="textarea" id="kitStandoutFeature" name="standoutFeature" rows="4">The site uses OpenAI for ideation and GitHub for live implementation proof in the same experience.</textarea>
                  </label>
                </div>

                <div class="field-grid two-up">
                  <label class="field">
                    <span class="field-label">Repo URL</span>
                    <input class="input" id="kitRepoUrl" name="repoUrl" placeholder="https://github.com/yourname/your-repo" type="url" />
                  </label>
                  <label class="field">
                    <span class="field-label">Deployment URL</span>
                    <input class="input" name="deploymentUrl" placeholder="https://your-live-site.vercel.app" type="url" />
                  </label>
                </div>

                <label class="field">
                  <span class="field-label">Proof you want judges to remember</span>
                  <input class="input" name="proofPoint" type="text" value="I shipped a polished live site with real API integrations and a clear student-facing use case." />
                </label>

                <div class="form-actions">
                  <button class="button primary" type="submit" id="kitSubmit">Generate submission kit</button>
                  <p class="inline-note" id="kitStatus">Use this after the concept feels right or after you have a repo link.</p>
                </div>
              </form>
            </div>

            <div class="workspace-surface">
              <div class="result-shell" id="kitResult">
                <div class="placeholder-card">
                  <p class="placeholder-kicker">Story package</p>
                  <h3>Your pitch, demo beats, and resume bullet will show up here.</h3>
                  <p>Once the idea lab generates a concept, those details will automatically prefill this form.</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="studio-panel panel" id="repo-pulse">
          <div class="studio-head">
            <div class="section-heading">
              <p class="eyebrow accent">Repo pulse</p>
              <h2 class="section-title">Pull live GitHub signals so the project story includes real shipping evidence.</h2>
              <p class="section-copy">
                Judges can say yes a lot faster to a live repo card than to a verbal claim. This section fetches stars,
                issues, languages, and recent commits from GitHub's API.
              </p>
            </div>
            <div class="studio-meta" aria-label="Repo pulse capabilities">
              <span class="mini-pill">GitHub</span>
              <span class="mini-pill">Stars and commits</span>
              <span class="mini-pill">Screenshot ready</span>
            </div>
          </div>

          <div class="studio-grid">
            <div class="workspace-surface">
              <form class="workspace-form compact-form" id="repoForm">
                <label class="field grow">
                  <span class="field-label">GitHub repository URL</span>
                  <input class="input" id="repoUrlInput" name="repoUrl" placeholder="https://github.com/owner/repository" type="url" />
                </label>
                <div class="form-actions inline">
                  <button class="button primary" type="submit" id="repoSubmit">Fetch repo pulse</button>
                  <p class="inline-note" id="repoStatus">GitHub works with public repositories out of the box.</p>
                </div>
              </form>
            </div>

            <div class="workspace-surface">
              <div class="result-shell" id="repoResult">
                <div class="placeholder-card">
                  <p class="placeholder-kicker">Live GitHub data</p>
                  <h3>Paste your repo URL and the proof board will populate.</h3>
                  <p>Great for screenshots, demos, and showing momentum without narrating every commit yourself.</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="section" id="launch-checklist">
        <article class="studio-panel panel checklist-shell">
          <div class="studio-head">
            <div class="section-heading">
              <p class="eyebrow accent">Launch checklist</p>
              <h2 class="section-title">Keep the scope tight enough that the demo survives contact with reality.</h2>
              <p class="section-copy">
                The original presentation emphasized seeded data, one polished loop, and proof captured while the app
                is stable. This checklist keeps the site honest about that.
              </p>
            </div>
            <div class="studio-meta" aria-label="Launch checklist focus">
              <span class="mini-pill">Stable flow</span>
              <span class="mini-pill">Screenshot pass</span>
              <span class="mini-pill">Final polish</span>
            </div>
          </div>

          <div class="checklist-grid">
            <div class="checklist-copy">
              <p>
                Use this as the last pass before you submit: working APIs, a current repo, rehearsed demo beats, and
                captured proof while the app is behaving.
              </p>
            </div>
            <div class="checklist-list" id="checklistList"></div>
          </div>
        </article>
      </section>
    </main>
  </div>
`;

const apiStatusPill = document.querySelector<HTMLDivElement>("#apiStatusPill")!;
const modelStatusPill = document.querySelector<HTMLDivElement>("#modelStatusPill")!;
const targetDateInput = document.querySelector<HTMLInputElement>("#targetDate")!;
const countdownValue = document.querySelector<HTMLParagraphElement>("#countdownValue")!;
const countdownCaption = document.querySelector<HTMLParagraphElement>("#countdownCaption")!;
const ideaForm = document.querySelector<HTMLFormElement>("#ideaForm")!;
const ideaResult = document.querySelector<HTMLDivElement>("#ideaResult")!;
const ideaStatus = document.querySelector<HTMLParagraphElement>("#ideaStatus")!;
const ideaSubmit = document.querySelector<HTMLButtonElement>("#ideaSubmit")!;
const kitForm = document.querySelector<HTMLFormElement>("#kitForm")!;
const kitResult = document.querySelector<HTMLDivElement>("#kitResult")!;
const kitStatus = document.querySelector<HTMLParagraphElement>("#kitStatus")!;
const kitSubmit = document.querySelector<HTMLButtonElement>("#kitSubmit")!;
const repoForm = document.querySelector<HTMLFormElement>("#repoForm")!;
const repoResult = document.querySelector<HTMLDivElement>("#repoResult")!;
const repoStatus = document.querySelector<HTMLParagraphElement>("#repoStatus")!;
const repoSubmit = document.querySelector<HTMLButtonElement>("#repoSubmit")!;
const checklistList = document.querySelector<HTMLDivElement>("#checklistList")!;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "#";
  }

  try {
    const url = new URL(trimmed);
    return url.toString();
  } catch {
    return "#";
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function createList(items: string[], className = "bullet-list"): string {
  return `<ul class="${className}">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text
    ? (JSON.parse(text) as Partial<T> & { error?: string })
    : ({} as Partial<T> & { error?: string });

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload as T;
}

function readStoredChecklist(): boolean[] {
  const raw = window.localStorage.getItem(checklistStorageKey);
  if (!raw) {
    return baseChecklist.map(() => false);
  }

  try {
    const parsed = JSON.parse(raw) as boolean[];
    if (Array.isArray(parsed)) {
      return baseChecklist.map((_, index) => Boolean(parsed[index]));
    }
  } catch {
    window.localStorage.removeItem(checklistStorageKey);
  }

  return baseChecklist.map(() => false);
}

function renderChecklist(): void {
  const states = readStoredChecklist();
  checklistList.innerHTML = baseChecklist
    .map(
      (item, index) => `
        <label class="check-row">
          <input data-check-index="${index}" type="checkbox" ${states[index] ? "checked" : ""} />
          <span>${escapeHtml(item)}</span>
        </label>
      `,
    )
    .join("");
}

function updateCountdown(): void {
  const targetValue = targetDateInput.value || defaultTargetDate;
  const now = new Date();
  const target = new Date(`${targetValue}T23:59:59`);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 1) {
    countdownValue.textContent = `${days} days`;
    countdownCaption.textContent = `until ${formatDate(targetValue)}`;
  } else if (days === 1) {
    countdownValue.textContent = "1 day";
    countdownCaption.textContent = `until ${formatDate(targetValue)}`;
  } else if (days === 0) {
    countdownValue.textContent = "Today";
    countdownCaption.textContent = "Use the stable build for screenshots and your final walkthrough.";
  } else {
    countdownValue.textContent = `${Math.abs(days)} days past`;
    countdownCaption.textContent = "Keep polishing, but the challenge story should already be captured.";
  }
}

function setButtonState(button: HTMLButtonElement, label: string, disabled: boolean): void {
  button.disabled = disabled;
  button.textContent = label;
}

function renderIdeaResult(data: BlueprintResponse): void {
  ideaResult.innerHTML = `
    <div class="result-grid">
      <article class="result-card spotlight">
        <p class="result-kicker">Product name</p>
        <h3>${escapeHtml(data.productName)}</h3>
        <p class="result-lede">${escapeHtml(data.oneLiner)}</p>
        <p class="result-copy">${escapeHtml(data.homepageHook)}</p>
      </article>

      <article class="result-card">
        <p class="result-kicker">Audience promise</p>
        <p>${escapeHtml(data.audiencePromise)}</p>
      </article>

      <article class="result-card">
        <p class="result-kicker">Core loop</p>
        ${createList(data.coreLoop)}
      </article>
    </div>

    <div class="result-grid dual">
      <article class="result-card">
        <p class="result-kicker">Standout features</p>
        <div class="stack-list">
          ${data.standoutFeatures
            .map(
              (feature) => `
                <div class="stack-item">
                  <h4>${escapeHtml(feature.title)}</h4>
                  <p>${escapeHtml(feature.detail)}</p>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="result-card">
        <p class="result-kicker">Landing-page sections</p>
        <div class="stack-list">
          ${data.landingSections
            .map(
              (section) => `
                <div class="stack-item">
                  <h4>${escapeHtml(section.title)}</h4>
                  <p>${escapeHtml(section.detail)}</p>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </div>

    <div class="result-grid dual">
      <article class="result-card">
        <p class="result-kicker">Demo steps</p>
        <ol class="number-list">
          ${data.demoSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
      </article>

      <article class="result-card">
        <p class="result-kicker">Launch checklist</p>
        ${createList(data.launchChecklist)}
      </article>
    </div>

    <div class="result-grid dual">
      <article class="result-card">
        <p class="result-kicker">Handshake summary</p>
        <p>${escapeHtml(data.handshakeSummary)}</p>
      </article>

      <article class="result-card">
        <p class="result-kicker">Resume bullet</p>
        <p>${escapeHtml(data.resumeBullet)}</p>
      </article>
    </div>
  `;
}

function renderSubmissionKit(data: SubmissionKitResponse): void {
  kitResult.innerHTML = `
    <div class="result-grid">
      <article class="result-card spotlight">
        <p class="result-kicker">Submission title</p>
        <h3>${escapeHtml(data.submissionTitle)}</h3>
        <p class="result-copy">${escapeHtml(data.pitch)}</p>
      </article>

      <article class="result-card">
        <p class="result-kicker">Resume bullet</p>
        <p>${escapeHtml(data.resumeBullet)}</p>
      </article>
    </div>

    <div class="result-grid dual">
      <article class="result-card">
        <p class="result-kicker">Demo script</p>
        <div class="stack-list">
          ${data.demoScript
            .map(
              (beat) => `
                <div class="stack-item demo-beat">
                  <span class="beat-time">${escapeHtml(beat.time)}</span>
                  <p>${escapeHtml(beat.line)}</p>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>

      <article class="result-card">
        <p class="result-kicker">Judge highlights</p>
        ${createList(data.judgeHighlights)}
      </article>
    </div>

    <div class="result-grid dual">
      <article class="result-card">
        <p class="result-kicker">Handshake description</p>
        <p>${escapeHtml(data.handshakeDescription)}</p>
      </article>

      <article class="result-card">
        <p class="result-kicker">Social post</p>
        <p>${escapeHtml(data.socialPost)}</p>
      </article>
    </div>
  `;
}

function renderRepoResult(data: RepoResponse): void {
  const { repo } = data;

  repoResult.innerHTML = `
    <div class="result-grid">
      <article class="result-card spotlight">
        <p class="result-kicker">Repository</p>
        <h3>${escapeHtml(repo.fullName)}</h3>
        <p class="result-copy">${escapeHtml(repo.description || "No description added yet.")}</p>
        <div class="link-row">
          <a class="inline-link" href="${safeUrl(repo.htmlUrl)}" rel="noreferrer" target="_blank">Open repo</a>
          ${
            repo.homepage
              ? `<a class="inline-link" href="${safeUrl(repo.homepage)}" rel="noreferrer" target="_blank">Open live site</a>`
              : ""
          }
        </div>
      </article>

      <article class="result-card stat-grid">
        <div>
          <p class="result-kicker">Stars</p>
          <p class="stat-value">${numberFormatter.format(repo.stars)}</p>
        </div>
        <div>
          <p class="result-kicker">Forks</p>
          <p class="stat-value">${numberFormatter.format(repo.forksCount)}</p>
        </div>
        <div>
          <p class="result-kicker">Open issues</p>
          <p class="stat-value">${numberFormatter.format(repo.openIssuesCount)}</p>
        </div>
        <div>
          <p class="result-kicker">Watchers</p>
          <p class="stat-value">${numberFormatter.format(repo.watchers)}</p>
        </div>
      </article>
    </div>

    <div class="result-grid dual">
      <article class="result-card">
        <p class="result-kicker">Repository facts</p>
        <ul class="bullet-list">
          <li>Primary language: ${escapeHtml(repo.primaryLanguage || "Not detected")}</li>
          <li>Default branch: ${escapeHtml(repo.defaultBranch)}</li>
          <li>Last push: ${escapeHtml(formatDate(repo.pushedAt))}</li>
          <li>Last update: ${escapeHtml(formatDate(repo.updatedAt))}</li>
          <li>License: ${escapeHtml(repo.license || "No license listed")}</li>
        </ul>
      </article>

      <article class="result-card">
        <p class="result-kicker">Language breakdown</p>
        <div class="language-list">
          ${
            data.languages.length
              ? data.languages
                  .map(
                    (language) => `
                      <div class="language-row">
                        <span>${escapeHtml(language.name)}</span>
                        <strong>${language.percent}%</strong>
                      </div>
                    `,
                  )
                  .join("")
              : "<p>No language data returned.</p>"
          }
        </div>
      </article>
    </div>

    <div class="result-grid">
      <article class="result-card">
        <p class="result-kicker">Recent commits</p>
        <div class="stack-list">
          ${
            data.recentCommits.length
              ? data.recentCommits
                  .map(
                    (commit) => `
                      <div class="stack-item">
                        <div class="commit-head">
                          <strong>${escapeHtml(commit.message)}</strong>
                          <a class="inline-link" href="${safeUrl(commit.url)}" rel="noreferrer" target="_blank">${escapeHtml(commit.sha)}</a>
                        </div>
                        <p>${escapeHtml(commit.author)} - ${escapeHtml(formatDate(commit.date))}</p>
                      </div>
                    `,
                  )
                  .join("")
              : "<p>No commit history returned.</p>"
          }
        </div>
      </article>
    </div>
  `;
}

function syncKitFields(data: BlueprintResponse): void {
  const productName = document.querySelector<HTMLInputElement>("#kitProductName");
  const audience = document.querySelector<HTMLInputElement>("#kitAudience");
  const transformation = document.querySelector<HTMLTextAreaElement>("#kitTransformation");
  const standoutFeature = document.querySelector<HTMLTextAreaElement>("#kitStandoutFeature");

  if (productName) {
    productName.value = data.productName;
  }

  if (audience) {
    audience.value = data.audiencePromise;
  }

  if (transformation) {
    transformation.value = data.coreLoop.join(" -> ");
  }

  if (standoutFeature) {
    standoutFeature.value = data.standoutFeatures
      .slice(0, 2)
      .map((feature) => `${feature.title}: ${feature.detail}`)
      .join(" ");
  }
}

function setStatusPill(element: HTMLDivElement, content: string, tone: "ok" | "warn" | "soft"): void {
  element.textContent = content;
  element.classList.remove("is-ok", "is-warn", "soft");
  if (tone === "ok") {
    element.classList.add("is-ok");
  } else if (tone === "warn") {
    element.classList.add("is-warn");
  } else {
    element.classList.add("soft");
  }
}

async function loadHealth(): Promise<void> {
  try {
    const health = await requestJson<HealthResponse>("/api/health", {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });

    setStatusPill(
      apiStatusPill,
      health.openaiConfigured ? "OpenAI connected" : "OpenAI key missing",
      health.openaiConfigured ? "ok" : "warn",
    );
    setStatusPill(
      modelStatusPill,
      `Model: ${health.model}${health.githubTokenConfigured ? " - GitHub token ready" : " - GitHub public mode"}`,
      "soft",
    );
  } catch (error) {
    setStatusPill(apiStatusPill, "API unavailable", "warn");
    setStatusPill(
      modelStatusPill,
      error instanceof Error ? error.message : "The server could not be reached.",
      "soft",
    );
  }
}

ideaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(ideaForm);

  setButtonState(ideaSubmit, "Generating...", true);
  ideaStatus.textContent = "OpenAI is shaping the concept, landing story, and demo flow.";

  try {
    const payload = {
      audience: String(formData.get("audience") ?? ""),
      brandVibe: String(formData.get("brandVibe") ?? ""),
      builderName: String(formData.get("builderName") ?? ""),
      desiredOutput: String(formData.get("desiredOutput") ?? ""),
      edge: String(formData.get("edge") ?? ""),
      magicInput: String(formData.get("magicInput") ?? ""),
      painPoint: String(formData.get("painPoint") ?? ""),
    };

    const blueprint = await requestJson<BlueprintResponse>("/api/blueprint", {
      body: JSON.stringify(payload),
      method: "POST",
    });

    renderIdeaResult(blueprint);
    syncKitFields(blueprint);
    ideaStatus.textContent = "Blueprint ready. The submission kit form has been prefilled with the generated concept.";
  } catch (error) {
    ideaStatus.textContent =
      error instanceof Error ? error.message : "The blueprint could not be generated.";
  } finally {
    setButtonState(ideaSubmit, "Generate blueprint", false);
  }
});

kitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(kitForm);

  setButtonState(kitSubmit, "Generating...", true);
  kitStatus.textContent = "OpenAI is drafting the submission story and demo beats.";

  try {
    const payload = {
      audience: String(formData.get("audience") ?? ""),
      deploymentUrl: String(formData.get("deploymentUrl") ?? ""),
      productName: String(formData.get("productName") ?? ""),
      proofPoint: String(formData.get("proofPoint") ?? ""),
      repoUrl: String(formData.get("repoUrl") ?? ""),
      standoutFeature: String(formData.get("standoutFeature") ?? ""),
      transformation: String(formData.get("transformation") ?? ""),
    };

    const submissionKit = await requestJson<SubmissionKitResponse>("/api/submission-kit", {
      body: JSON.stringify(payload),
      method: "POST",
    });

    renderSubmissionKit(submissionKit);
    kitStatus.textContent = "Submission kit ready. These blocks are good candidates for your demo notes, Handshake entry, and resume bullet.";
  } catch (error) {
    kitStatus.textContent =
      error instanceof Error ? error.message : "The submission kit could not be generated.";
  } finally {
    setButtonState(kitSubmit, "Generate submission kit", false);
  }
});

repoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(repoForm);
  const repoUrl = String(formData.get("repoUrl") ?? "");
  const kitRepoUrl = document.querySelector<HTMLInputElement>("#kitRepoUrl");

  setButtonState(repoSubmit, "Fetching...", true);
  repoStatus.textContent = "GitHub is returning live repository data.";

  try {
    const query = new URLSearchParams({ url: repoUrl });
    const repoData = await requestJson<RepoResponse>(`/api/github/repo?${query.toString()}`, {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });

    renderRepoResult(repoData);
    repoStatus.textContent = "Repo pulse ready. This is strong evidence for screenshots and your walkthrough.";
    if (kitRepoUrl && !kitRepoUrl.value.trim()) {
      kitRepoUrl.value = repoUrl;
    }
  } catch (error) {
    repoStatus.textContent =
      error instanceof Error ? error.message : "The repository data could not be loaded.";
  } finally {
    setButtonState(repoSubmit, "Fetch repo pulse", false);
  }
});

targetDateInput.value = window.localStorage.getItem(targetDateStorageKey) ?? defaultTargetDate;
targetDateInput.addEventListener("change", () => {
  window.localStorage.setItem(targetDateStorageKey, targetDateInput.value);
  updateCountdown();
});

checklistList.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const index = Number(target.dataset.checkIndex);
  const states = readStoredChecklist();
  states[index] = target.checked;
  window.localStorage.setItem(checklistStorageKey, JSON.stringify(states));
});

renderChecklist();
updateCountdown();
void loadHealth();
