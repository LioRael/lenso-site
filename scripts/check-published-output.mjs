import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDraftDocument, routeForDocument, walkFiles } from './docs-files.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = process.env.NEXT_OUTPUT_ROOT ? resolve(root, process.env.NEXT_OUTPUT_ROOT) : join(root, 'out');
const docsRoot = join(root, 'content/docs');
const failures = [];

function requireFile(path) {
  const absolute = join(outputRoot, path);
  if (!existsSync(absolute)) failures.push(`out/${path}: missing`);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

for (const path of ['index.html', 'plugins/index.html', 'plugins/lenso.web-ingress/0.4.5/index.html', 'docs/index.html', 'docs/zh/index.html', 'api/search', 'llms.txt', 'llms-full.txt', 'robots.txt', 'sitemap.xml']) requireFile(path);

for (const [path, markers] of [
  ['index.html', ['Build the system.', 'Choose the shortest path', 'Browse plugins']],
  ['plugins/index.html', ['Candidate releases', 'lenso.web-ingress', 'Not yet catalog-signed']],
  ['plugins/lenso.web-ingress/0.4.5/index.html', ['Candidate documentation', 'lenso-web-ingress-plugin', 'No implicit portable fallback']],
  ['docs/index.html', ['Lenso documentation', 'What do you want to build?']],
  ['docs/zh/index.html', ['Lenso 文档', '你想构建什么？']],
]) {
  const html = requireFile(path);
  for (const marker of markers) if (!html.includes(marker)) failures.push(`out/${path}: missing ${JSON.stringify(marker)}`);
}

const llms = requireFile('llms.txt');
const llmsFull = requireFile('llms-full.txt');
const documents = walkFiles(docsRoot).filter((file) => file.endsWith('.mdx'));
for (const document of documents.filter((file) => !isDraftDocument(file))) {
  const route = routeForDocument(docsRoot, document);
  if (!llms.includes(`](${route})`)) failures.push(`out/llms.txt: missing ${route}`);
  requireFile(`${route.slice(1)}/index.html`);
  const routeSuffix = route.replace(/^\/docs\/?/, '');
  const markdown = routeSuffix ? `llms.mdx/docs/${routeSuffix}/content.md` : 'llms.mdx/docs/content.md';
  requireFile(markdown);
}
for (const document of documents.filter(isDraftDocument)) {
  const route = routeForDocument(docsRoot, document);
  const routeSuffix = route.replace(/^\/docs\/?/, '');
  for (const path of [
    `${route.slice(1)}/index.html`,
    routeSuffix ? `llms.mdx/docs/${routeSuffix}/content.md` : 'llms.mdx/docs/content.md',
  ]) {
    if (existsSync(join(outputRoot, path))) failures.push(`out/${path}: draft document was published`);
  }
}
if (!llmsFull.includes('# Lenso documentation (/docs)')) failures.push('out/llms-full.txt: missing English root');
if (!llmsFull.includes('# Lenso 文档 (/docs/zh)')) failures.push('out/llms-full.txt: missing Chinese root');
if (/(?:^|\/)(?:mcp|webmcp)(?:\/|$)|\.well-known\//iu.test(JSON.stringify({ llms, llmsFull }))) failures.push('AI-readable catalogs advertise an unsupported MCP endpoint');

for (const file of walkFiles(outputRoot).filter((candidate) => candidate.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const outputPath = relative(outputRoot, file);
  const pageUrl = new URL(outputPath.replace(/(?:index)?\.html$/, ''), 'https://lenso.dev/');
  for (const match of html.matchAll(/(?:^|\s)href=["']([^"']+)["']/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(href)) continue;
    const target = new URL(href, pageUrl);
    const pathname = decodeURIComponent(target.pathname).replace(/^\/+/, '');
    const candidates = extname(pathname)
      ? [pathname]
      : [join(pathname, 'index.html'), `${pathname}.html`, pathname];
    if (!candidates.some((candidate) => existsSync(join(outputRoot, candidate)))) {
      failures.push(`out/${outputPath}: local link ${JSON.stringify(href)} has no published target`);
    }
  }
}

for (const file of walkFiles(join(outputRoot, 'docs', 'zh')).filter((candidate) => candidate.endsWith('.html'))) {
  if (!readFileSync(file, 'utf8').includes('<html lang="zh-CN"')) failures.push(`out/${relative(outputRoot, file)}: expected lang="zh-CN"`);
}

if (failures.length) {
  console.error(`Published-output checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Published-output checks passed: Next.js pages, candidate isolation, EN/ZH docs, search and AI-readable artifacts.');
