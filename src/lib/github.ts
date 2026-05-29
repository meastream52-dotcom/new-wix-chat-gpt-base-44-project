export interface GitHubRepo {
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
}

export interface GitHubFile {
  path: string;
  content: string;
  message?: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG;

async function ghFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const base = "https://api.github.com";
  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

export async function createRepo(name: string, description: string, isPrivate = true): Promise<GitHubRepo> {
  if (!GITHUB_TOKEN) {
    return { fullName: `demo/${name}`, htmlUrl: `https://github.com/demo/${name}`, cloneUrl: `https://github.com/demo/${name}.git`, defaultBranch: "main" };
  }
  const owner = GITHUB_ORG ?? "me";
  const endpoint = GITHUB_ORG ? `/orgs/${GITHUB_ORG}/repos` : `/user/repos`;
  const res = await ghFetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: true }),
  });
  if (!res.ok) throw new Error(`GitHub create repo failed: ${res.statusText}`);
  const data = await res.json();
  return { fullName: data.full_name, htmlUrl: data.html_url, cloneUrl: data.clone_url, defaultBranch: data.default_branch };
}

export async function pushFiles(repo: string, files: GitHubFile[], branch = "main"): Promise<void> {
  if (!GITHUB_TOKEN) return;
  for (const file of files) {
    const encoded = Buffer.from(file.content).toString("base64");
    let sha: string | undefined;
    const existing = await ghFetch(`/repos/${repo}/contents/${file.path}?ref=${branch}`);
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
    await ghFetch(`/repos/${repo}/contents/${file.path}`, {
      method: "PUT",
      body: JSON.stringify({
        message: file.message ?? `Add ${file.path}`,
        content: encoded,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });
  }
}

export async function createDeployment(repo: string, ref = "main", environment = "production"): Promise<number> {
  if (!GITHUB_TOKEN) return 0;
  const res = await ghFetch(`/repos/${repo}/deployments`, {
    method: "POST",
    body: JSON.stringify({ ref, environment, required_contexts: [], auto_merge: false }),
  });
  const data = await res.json();
  return data.id as number;
}
