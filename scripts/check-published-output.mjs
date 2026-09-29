import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDraftDocument, routeForDocument, walkFiles } from './docs-files.mjs';
import { validatePublishedCatalogProof } from './published-catalog-proof.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = process.env.NEXT_OUTPUT_ROOT ? resolve(root, process.env.NEXT_OUTPUT_ROOT) : join(root, 'out');
const docsRoot = join(root, 'content/docs');
const signedCatalog = JSON.parse(readFileSync(join(root, 'lib/.generated/linked-catalog.json'), 'utf8'));
const signedPortableCatalog = JSON.parse(readFileSync(join(root, 'lib/.generated/portable-catalog.json'), 'utf8'));
const signedPackageCatalog = JSON.parse(readFileSync(join(root, 'lib/.generated/package-catalog.json'), 'utf8'));
const signedContentCatalog = JSON.parse(readFileSync(join(root, 'lib/.generated/release-content.json'), 'utf8'));
const signedDocuments = JSON.parse(readFileSync(join(root, 'lib/.generated/linked-documents.json'), 'utf8'));
const failures = [];

for (const path of [
  'plugins/_no-signed-document',
  'api/plugins/_no-signed-document',
  'api/plugins/releases/_no-signed-release',
]) {
  if (existsSync(join(outputRoot, path))) failures.push(`out/${path}: static-generation placeholder was published`);
}

function requireFile(path) {
  const absolute = join(outputRoot, path);
  if (!existsSync(absolute)) failures.push(`out/${path}: missing`);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

for (const path of ['index.html', 'plugins/index.html', 'plugins/lenso.web-ingress/0.4.5/index.html', 'docs/index.html', 'docs/zh/index.html', 'api/search', 'api/plugins/search', 'api/plugins/catalog.json', 'llms.txt', 'llms-full.txt', 'robots.txt', 'sitemap.xml']) requireFile(path);

for (const line of requireFile('_redirects').trim().split(/\r?\n/u)) {
  const [from, to, status, ...extra] = line.split(/\s+/u);
  if (!from?.startsWith('/') || !to?.startsWith('/docs/') || status !== '301' || extra.length) {
    failures.push(`out/_redirects: invalid entry ${JSON.stringify(line)}`);
    continue;
  }
  if (!existsSync(join(outputRoot, to.replace(/^\/+/, ''), 'index.html'))) {
    failures.push(`out/_redirects: ${from} targets an unpublished page ${to}`);
  }
}

for (const [path, markers] of [
  ['index.html', ['Build the system.', 'Choose the shortest path', 'Preview app quickstart', 'Browse plugins']],
  ['plugins/index.html', ['Candidate releases', 'lenso.web-ingress']],
  ['docs/index.html', ['Lenso documentation', 'Choose your role', 'Build an App', 'Develop a Plugin', 'Extend the framework']],
  ['docs/zh/index.html', ['Lenso 文档', '选择你的角色', '构建 App', '开发 Plugin', '扩展框架']],
]) {
  const html = requireFile(path);
  for (const marker of markers) if (!html.includes(marker)) failures.push(`out/${path}: missing ${JSON.stringify(marker)}`);
}
for (const [slug, englishTitle, chineseTitle] of [
  ['build-apps', 'Build an App', '构建 App'],
  ['develop-plugins', 'Develop a Plugin', '开发 Plugin'],
  ['extend-framework', 'Extend the framework', '扩展框架'],
]) {
  const englishRoute = `/docs/${slug}/`;
  const chineseRoute = `/docs/zh/${slug}/`;
  const english = requireFile(`docs/${slug}/index.html`);
  const chinese = requireFile(`docs/zh/${slug}/index.html`);
  if (!english.includes(englishTitle) || !english.includes(`href="${chineseRoute.slice(0, -1)}"`)) failures.push(`out/docs/${slug}/index.html: role path or locale switch missing`);
  if (!chinese.includes(chineseTitle) || !chinese.includes(`href="${englishRoute.slice(0, -1)}"`)) failures.push(`out/docs/zh/${slug}/index.html: role path or locale switch missing`);
  if (!requireFile('docs/index.html').includes(englishRoute)) failures.push(`out/docs/index.html: missing role path ${englishRoute}`);
  if (!requireFile('docs/zh/index.html').includes(chineseRoute)) failures.push(`out/docs/zh/index.html: missing role path ${chineseRoute}`);
  if (!requireFile('index.html').includes(englishRoute)) failures.push(`out/index.html: missing role path ${englishRoute}`);
}
const candidateSigned = [...signedCatalog.releases, ...signedPortableCatalog.releases,
  ...signedPackageCatalog.releases, ...signedContentCatalog.releases.filter((release) => release.baseKind === 'content_only')]
  .some((release) => release.pluginId === 'lenso.web-ingress' && release.version === '0.4.5');
function requireReleaseNavigationPayload(pluginId, version) {
  const directory = `plugins/${pluginId}/${version}`;
  const expected = requireFile(`${directory}/index.txt`);
  const actual = requireFile(`plugins/${pluginId}/${version}.txt`);
  if (actual !== expected) failures.push(`out/${directory}: client navigation payload does not match the published release`);
}
requireReleaseNavigationPayload('lenso.web-ingress', '0.4.5');
if (!candidateSigned) {
  const directory = requireFile('plugins/index.html');
  for (const marker of ['Not yet catalog-signed', 'migration-era example', 'github.com/LioRael/lenso/tree/main/crates/lenso-web-ingress-plugin']) {
    if (!directory.includes(marker)) failures.push(`out/plugins/index.html: unsigned historical candidate marker missing ${JSON.stringify(marker)}`);
  }
  const html = requireFile('plugins/lenso.web-ingress/0.4.5/index.html');
  for (const marker of ['Candidate documentation', 'migration-era source evidence', 'lenso-web-ingress-plugin', 'No implicit portable fallback',
    'github.com/LioRael/lenso-web/commit/0e93f1149ac1b0905a51d76692d369a028f3a532',
    'github.com/LioRael/lenso/tree/main/crates/lenso-web-ingress-plugin']) {
    if (!html.includes(marker)) failures.push(`out/plugins/lenso.web-ingress/0.4.5/index.html: missing ${JSON.stringify(marker)}`);
  }
}
const pluginIndex = requireFile('plugins/index.html');
const pluginSearch = requireFile('api/plugins/search');
const pluginDirectory = JSON.parse(requireFile('api/plugins/catalog.json'));
const signedIdentities = new Set([...signedCatalog.releases, ...signedPortableCatalog.releases,
  ...signedPackageCatalog.releases, ...signedContentCatalog.releases.filter((release) => release.baseKind === 'content_only')]
  .map((release) => `${release.pluginId}\0${release.version}`));
try {
  validatePublishedCatalogProof(pluginDirectory, [signedCatalog, signedPortableCatalog, signedPackageCatalog, signedContentCatalog]);
} catch (error) {
  failures.push(`out/api/plugins/catalog.json: verification source or provenance mismatch: ${error.message}`);
}
if (pluginDirectory.releases.length !== signedIdentities.size) {
  failures.push('out/api/plugins/catalog.json: signed release count mismatch');
}
for (const release of pluginDirectory.releases) {
  const identity = `${release.pluginId}\0${release.version}`;
  if (!signedIdentities.delete(identity)) failures.push(`out/api/plugins/catalog.json: duplicate or unsigned release ${identity}`);
  const exactPath = `api/plugins/releases/${release.pluginId}/${release.version}/release.json`;
  const exact = JSON.parse(requireFile(exactPath));
  if (JSON.stringify(exact) !== JSON.stringify(release) || release.apiUrl !== `/${exactPath}`) {
    failures.push(`out/${exactPath}: exact version does not match unified catalog`);
  }
  const linked = signedCatalog.releases.find((item) => item.pluginId === release.pluginId && item.version === release.version);
  const portable = signedPortableCatalog.releases.find((item) => item.pluginId === release.pluginId && item.version === release.version);
  const packages = signedPackageCatalog.releases.find((item) => item.pluginId === release.pluginId && item.version === release.version);
  const content = signedContentCatalog.releases.find((item) => item.pluginId === release.pluginId && item.version === release.version);
  const channels = release.distributions.map((item) => item.kind);
  if (channels.length !== Number(Boolean(linked)) + Number(Boolean(portable)) + Number(Boolean(packages))
    || (linked && !release.distributions.some((item) => item.kind === 'linked_cargo'
      && item.expiresAt === signedCatalog.expiresAt && item.release.crateDigest === linked.crateDigest))
    || (portable && !release.distributions.some((item) => item.kind === 'portable_bundle'
      && item.expiresAt === signedPortableCatalog.expiresAt && item.release.artifactDigest === portable.artifactDigest))
    || (packages && !release.distributions.some((item) => item.kind === 'npm_package'
      && item.expiresAt === signedPackageCatalog.expiresAt
      && JSON.stringify(item.release.distributions) === JSON.stringify(packages.distributions)))) {
    failures.push(`out/api/plugins/catalog.json: distribution mismatch for ${identity}`);
  }
  if ((content ? release.optionalSourceContent.length !== 1
    || release.optionalSourceContent[0].release.baseReleaseIdentity !== content.baseReleaseIdentity
    : release.optionalSourceContent.length !== 0)) {
    failures.push(`out/api/plugins/catalog.json: source content mismatch for ${identity}`);
  }
  for (const distribution of release.distributions) {
    const source = distribution.kind === 'linked_cargo' ? linked
      : distribution.kind === 'portable_bundle' ? portable : packages;
    for (const document of distribution.release.documentation) {
      const expected = source?.documentation.find((item) => item.slug === document.slug);
      const markdownPath = `/api/plugins/${release.pluginId}/${release.version}/docs/${document.slug}/content.md`;
      if (!expected || expected.digest !== document.digest
        || document.markdownUrl !== markdownPath
        || document.pageUrl !== `/plugins/${release.pluginId}/${release.version}/docs/${document.slug}`) {
        failures.push(`out/api/plugins/catalog.json: versioned documentation mismatch for ${identity}`);
      }
    }
  }
}
if (signedIdentities.size) failures.push('out/api/plugins/catalog.json: signed releases omitted');
if (pluginDirectory.releases.some((release) => release.pluginId === 'lenso.web-ingress' && release.version === '0.4.5')
  && !candidateSigned) failures.push('out/api/plugins/catalog.json: unsigned historical Web candidate leaked');
const sitemap = requireFile('sitemap.xml');
for (const release of signedPortableCatalog.releases) {
  const route = `plugins/${release.pluginId}/${release.version}`;
  requireReleaseNavigationPayload(release.pluginId, release.version);
  const html = requireFile(`${route}/index.html`);
  if (!html.includes(release.title) || !html.includes(release.artifactDigest)) failures.push(`out/${route}/index.html: signed Portable evidence missing`);
  if (!pluginIndex.includes(`/${route}`)) failures.push(`out/plugins/index.html: signed Portable release link missing for ${route}`);
  if (!sitemap.includes(`/${route}`)) failures.push(`out/sitemap.xml: signed Portable release missing for ${route}`);
  for (const marker of [release.pluginId, release.version, release.artifactDigest, 'Portable Bundle']) {
    if (!pluginIndex.includes(marker)) failures.push(`out/plugins/index.html: signed Portable release missing ${JSON.stringify(marker)}`);
  }
  for (const document of release.documentation) {
    const documentRoute = `${route}/docs/${document.slug}`;
    const page = requireFile(`${documentRoute}/index.html`);
    const markdown = requireFile(`api/${documentRoute}/content.md`);
    if (!page.includes(document.topic) || !page.includes('Portable')) failures.push(`out/${documentRoute}/index.html: Portable document provenance missing`);
    if (markdown !== signedDocuments[document.slug]?.content || signedDocuments[document.slug]?.channel !== 'portable') failures.push(`out/api/${documentRoute}/content.md: Portable verified Markdown mismatch`);
    if (!pluginSearch.includes(`/${documentRoute}`)) failures.push(`out/api/plugins/search: signed Portable document missing for ${documentRoute}`);
    if (!sitemap.includes(`/${documentRoute}`)) failures.push(`out/sitemap.xml: signed Portable document missing for ${documentRoute}`);
  }
}
for (const release of signedCatalog.releases) {
  const route = `plugins/${release.pluginId}/${release.version}`;
  requireReleaseNavigationPayload(release.pluginId, release.version);
  const html = requireFile(`${route}/index.html`);
  if (!html.includes(release.title) || !html.includes(release.crateDigest)) failures.push(`out/${route}/index.html: signed release evidence missing`);
  if (!pluginIndex.includes(`/${route}`)) failures.push(`out/plugins/index.html: signed release link missing for ${route}`);
  if (!sitemap.includes(`/${route}`)) failures.push(`out/sitemap.xml: signed release missing for ${route}`);
  for (const document of release.documentation) {
    const documentRoute = `${route}/docs/${document.slug}`;
    const page = requireFile(`${documentRoute}/index.html`);
    const markdown = requireFile(`api/${documentRoute}/content.md`);
    if (!page.includes(document.topic)) failures.push(`out/${documentRoute}/index.html: document topic missing`);
    if (markdown !== signedDocuments[document.slug]?.content || signedDocuments[document.slug]?.channel !== 'linked') failures.push(`out/api/${documentRoute}/content.md: linked verified Markdown mismatch`);
    if (!pluginSearch.includes(`/${documentRoute}`)) failures.push(`out/api/plugins/search: signed linked document missing for ${documentRoute}`);
    if (!sitemap.includes(`/${documentRoute}`)) failures.push(`out/sitemap.xml: signed document missing for ${documentRoute}`);
  }
}
for (const release of signedPackageCatalog.releases) {
  const route = `plugins/${release.pluginId}/${release.version}`;
  requireReleaseNavigationPayload(release.pluginId, release.version);
  const html = requireFile(`${route}/index.html`);
  if (!html.includes(release.title) || !release.distributions.every((item) => html.includes(item.integrity))) {
    failures.push(`out/${route}/index.html: signed npm package evidence missing`);
  }
  if (!pluginIndex.includes(`/${route}`)) failures.push(`out/plugins/index.html: signed npm release link missing for ${route}`);
  if (!sitemap.includes(`/${route}`)) failures.push(`out/sitemap.xml: signed npm release missing for ${route}`);
  for (const document of release.documentation) {
    const documentRoute = `${route}/docs/${document.slug}`;
    const page = requireFile(`${documentRoute}/index.html`);
    const markdown = requireFile(`api/${documentRoute}/content.md`);
    if (!page.includes(document.topic) || !page.includes('npm package')) failures.push(`out/${documentRoute}/index.html: npm document provenance missing`);
    if (markdown !== signedDocuments[document.slug]?.content || signedDocuments[document.slug]?.channel !== 'package') {
      failures.push(`out/api/${documentRoute}/content.md: npm verified Markdown mismatch`);
    }
    if (!pluginSearch.includes(`/${documentRoute}`)) failures.push(`out/api/plugins/search: signed npm document missing for ${documentRoute}`);
    if (!sitemap.includes(`/${documentRoute}`)) failures.push(`out/sitemap.xml: signed npm document missing for ${documentRoute}`);
  }
}
for (const release of signedContentCatalog.releases.filter((item) => item.baseKind === 'content_only')) {
  const route = `plugins/${release.pluginId}/${release.version}`;
  requireReleaseNavigationPayload(release.pluginId, release.version);
  const html = requireFile(`${route}/index.html`);
  if (!html.includes(release.metadata.title) || !html.includes(release.baseReleaseIdentity)
    || !release.content.every((item) => html.includes(item.digest))) {
    failures.push(`out/${route}/index.html: signed source-only evidence missing`);
  }
  if (!pluginIndex.includes(`/${route}`)) failures.push(`out/plugins/index.html: signed source-only release link missing for ${route}`);
  if (!sitemap.includes(`/${route}`)) failures.push(`out/sitemap.xml: signed source-only release missing for ${route}`);
  for (const document of release.metadata.documentation) {
    const documentRoute = `${route}/docs/${document.slug}`;
    const page = requireFile(`${documentRoute}/index.html`);
    const markdown = requireFile(`api/${documentRoute}/content.md`);
    if (!page.includes(document.topic) || !page.includes('source content')) failures.push(`out/${documentRoute}/index.html: source-only document provenance missing`);
    if (markdown !== signedDocuments[document.slug]?.content || signedDocuments[document.slug]?.channel !== 'content') {
      failures.push(`out/api/${documentRoute}/content.md: source-only verified Markdown mismatch`);
    }
    if (!pluginSearch.includes(`/${documentRoute}`)) failures.push(`out/api/plugins/search: source-only document missing for ${documentRoute}`);
    if (!sitemap.includes(`/${documentRoute}`)) failures.push(`out/sitemap.xml: source-only document missing for ${documentRoute}`);
  }
}

const llms = requireFile('llms.txt');
const llmsFull = requireFile('llms-full.txt');
const documentationSearch = requireFile('api/search');
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
  for (const [path, text] of [
    ['llms.txt', llms], ['llms-full.txt', llmsFull],
    ['api/search', documentationSearch], ['sitemap.xml', sitemap],
  ]) {
    if (text.includes(route)) failures.push(`out/${path}: draft document ${route} was advertised`);
  }
}
if (!llmsFull.includes('# Lenso documentation (/docs)')) failures.push('out/llms-full.txt: missing English root');
if (!llmsFull.includes('# Lenso 文档 (/docs/zh)')) failures.push('out/llms-full.txt: missing Chinese root');
if (!llms.includes('/api/plugins/catalog.json') || !llmsFull.includes('/api/plugins/catalog.json')) failures.push('Agent-readable indexes omit signed Plugin directory API');
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
console.log('Published-output checks passed: Next.js pages, signed Portable and linked listings, exact JSON API, candidate isolation, EN/ZH docs, search and AI-readable artifacts.');
