#!/usr/bin/env node
/**
 * Fetches GitHub repo languages using GITHUB_TOKEN.
 * Aggregates across all repos (public + private) and writes github-stats.json.
 * Run from GitHub Actions with GH_STATS_TOKEN as repo secret.
 */

const fs = require('fs');
const path = require('path');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Missing GITHUB_TOKEN (set by workflow from GH_STATS_TOKEN secret)');
  process.exit(1);
}

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
};

async function fetchRepos() {
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
