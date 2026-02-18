#!/usr/bin/env node
/**
 * Fetches GitHub repo languages and writes github-stats.json.
 * If GITHUB_TOKEN is set (recommended: GH_STATS_TOKEN secret), private repos are included.
 * Without a token, falls back to public repos for GITHUB_STATS_USERNAME.
 */

const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN?.trim();
const username = (
  process.env.GITHUB_STATS_USERNAME ||
  process.env.GITHUB_REPOSITORY_OWNER ||
  ''
).trim();
const hasToken = Boolean(token);

const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'acwints-github-stats',
};
if (hasToken) headers.Authorization = `Bearer ${token}`;

async function fetchReposWithUserToken() {
  const repos = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&type=all&sort=updated&page=${page}`,
      { headers }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch repos: ${res.status} ${await res.text()}`);
    }
    const pageRepos = await res.json();
    if (pageRepos.length === 0) break;
    repos.push(...pageRepos.filter((r) => !r.fork));
    if (pageRepos.length < 100) break;
    page++;
  }
  return repos;
}

async function fetchPublicRepos(owner) {
  const repos = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(owner)}/repos?per_page=100&type=owner&sort=updated&page=${page}`,
      { headers }
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch public repos for ${owner}: ${res.status} ${await res.text()}`);
    }
    const pageRepos = await res.json();
    if (pageRepos.length === 0) break;
    repos.push(...pageRepos.filter((r) => !r.fork));
    if (pageRepos.length < 100) break;
    page++;
  }
  return repos;
}

async function fetchRepos() {
  if (hasToken) {
    try {
      const repos = await fetchReposWithUserToken();
      if (repos.length > 0) return repos;
      console.warn('Authenticated repo query returned 0 repos. Falling back to public repos.');
    } catch (err) {
      console.warn(`Authenticated repo query failed (${err.message}). Falling back to public repos.`);
    }
  }

  if (!username) {
    throw new Error('Missing GITHUB_STATS_USERNAME for public fallback mode');
  }
  return fetchPublicRepos(username);
}

async function fetchLanguages(owner, repo) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    { headers }
  );
  if (res.status === 404 || res.status === 204) return {};
  if (!res.ok) {
    console.warn(`Skipping ${owner}/${repo}: ${res.status}`);
    return {};
  }
  return res.json();
}

async function main() {
  const repos = await fetchRepos();
  if (repos.length === 0) {
    console.warn('No repositories found; writing empty language data.');
  }
  const aggregated = {};

  for (const r of repos) {
    const langs = await fetchLanguages(r.owner.login, r.name);
    for (const [lang, bytes] of Object.entries(langs)) {
      aggregated[lang] = (aggregated[lang] || 0) + bytes;
    }
    // Rate limit: ~5000 req/hr authenticated, but be gentle
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const sorted = Object.entries(aggregated)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});

  const output = {
    languages: sorted,
    updatedAt: new Date().toISOString(),
  };

  const outPath = path.join(process.cwd(), 'github-stats.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath} with ${Object.keys(sorted).length} languages`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
