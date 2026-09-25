import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { walkFiles } from './docs-files.mjs';
import { assertAllowedExternalUrl, isPublishedSiteUrl } from './external-link-policy.mjs';

const outputRoot = join(process.cwd(), 'out');
const links = new Map();

for (const file of walkFiles(outputRoot).filter((candidate) => candidate.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:^|\s)href=["'](https?:\/\/[^"']+)["']/g)) {
    const url = new URL(match[1]);
    url.hash = '';
    const value = url.toString();
    if (!links.has(value)) links.set(value, relative(outputRoot, file));
  }
}

const entries = [...links];
const failures = [];
let cursor = 0;

async function requestFollowingRedirects(initialUrl, method) {
  let url = new URL(initialUrl);
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    assertAllowedExternalUrl(url);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'lenso-site-link-check/1.0' },
      method,
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (!location) throw new Error(`redirect ${response.status} omitted Location`);
    url = new URL(location, url);
  }
  throw new Error('redirect limit exceeded');
}

async function check(url, source) {
  if (isPublishedSiteUrl(new URL(url), outputRoot)) return;
  let response = await requestFollowingRedirects(url, 'HEAD');
  if (!response.ok) {
    await response.body?.cancel();
    response = await requestFollowingRedirects(url, 'GET');
  }
  await response.body?.cancel();
  if (!response.ok && ![401, 403, 405, 429].includes(response.status)) failures.push(`${source}: ${url} returned ${response.status}`);
}

async function worker() {
  while (cursor < entries.length) {
    const [url, source] = entries[cursor++];
    try {
      await check(url, source);
    } catch (error) {
      failures.push(`${source}: ${url} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(6, entries.length) }, () => worker()));

if (failures.length) {
  console.error(`External-link checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`External-link checks passed: ${entries.length} public URLs; own-site targets resolved from static output.`);
