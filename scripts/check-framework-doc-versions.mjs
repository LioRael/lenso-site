import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = process.env.NEXT_OUTPUT_ROOT ? resolve(root, process.env.NEXT_OUTPUT_ROOT) : join(root, 'out');
const read = (path) => readFileSync(join(outputRoot, path), 'utf8');
const digest = /^sha256:[a-f0-9]{64}$/;

const manifest = JSON.parse(read('api/docs/versions'));
assert.equal(manifest.schema, 'lenso.site.framework-docs.v1');
assert.equal(manifest.preview.channel, 'development-preview');
assert.equal(manifest.preview.frameworkVersion, null);
assert.equal(manifest.preview.route, '/docs');
assert.deepEqual(manifest.preview.locales, ['en', 'zh-CN']);
assert.match(manifest.preview.revision, digest);
assert.deepEqual(manifest.published, [], 'Unpublished framework docs must not claim historical release snapshots.');

const searchIndex = JSON.parse(read('api/search'));
const records = Object.values(searchIndex.docs.docs);
for (const [route, markdownPath, htmlPath, locale] of [
  ['/docs', 'llms.mdx/docs/content.md', 'docs/index.html', 'en'],
  ['/docs/zh', 'llms.mdx/docs/zh/content.md', 'docs/zh/index.html', 'zh-CN'],
  ['/docs/core/app-quickstart', 'llms.mdx/docs/core/app-quickstart/content.md', 'docs/core/app-quickstart/index.html', 'en'],
  ['/docs/zh/core/app-quickstart', 'llms.mdx/docs/zh/core/app-quickstart/content.md', 'docs/zh/core/app-quickstart/index.html', 'zh-CN'],
]) {
  const markdown = read(markdownPath);
  const html = read(htmlPath);
  const revision = markdown.match(/^content_revision: (sha256:[a-f0-9]{64})$/m)?.[1];
  assert.ok(revision, `${route}: missing Markdown content revision`);
  assert.match(markdown, /^documentation_channel: development-preview$/m);
  assert.match(markdown, /^framework_version: null$/m);
  assert.ok(markdown.includes(`locale: ${locale}\n`), `${route}: wrong Markdown locale`);
  assert.ok(markdown.includes(`canonical_url: ${route}\n`), `${route}: wrong Markdown canonical route`);
  assert.ok(html.includes('data-document-channel="development-preview"'), `${route}: missing visible preview identity`);
  assert.ok(html.includes(`data-content-revision="${revision}"`), `${route}: HTML/Markdown revisions differ`);
  const result = records.find((record) => record.url === route && record.type === 'page');
  assert.ok(result, `${route}: missing search page record`);
  assert.ok(result.tags.includes('channel:development-preview'), `${route}: search channel missing`);
  assert.ok(result.tags.includes(`locale:${locale}`), `${route}: search locale missing`);
  assert.ok(result.tags.includes(`revision:${revision}`), `${route}: search revision differs`);
}

for (const [route, locale] of [['docs/versions/index.html', 'en'], ['docs/zh/versions/index.html', 'zh-CN']]) {
  const html = read(route);
  assert.ok(html.includes(locale === 'en' ? 'no published framework-version snapshots' : '尚未包含已发布框架版本'), `${route}: published-empty state missing`);
  assert.ok(html.includes(`action="${locale === 'en' ? '/docs/versions' : '/docs/zh/versions'}"`), `${route}: exact-version form missing`);
  assert.ok(html.includes('name="version"'), `${route}: exact-version field missing`);
  assert.ok(html.includes(manifest.preview.revision), `${route}: preview corpus revision differs`);
  assert.ok(html.includes(locale === 'en' ? 'href="/docs/zh/versions/"' : 'href="/docs/versions/"'), `${route}: locale switch missing`);
}
assert.ok(read('sitemap.xml').includes('https://lenso.dev/docs/versions<'));
assert.ok(read('sitemap.xml').includes('https://lenso.dev/docs/zh/versions<'));

for (const route of ['llms.txt', 'llms-full.txt']) {
  const text = read(route);
  assert.ok(text.includes('Channel: development-preview'), `${route}: channel missing`);
  assert.ok(text.includes('Published framework versions: none in this Site build'), `${route}: published state missing`);
  assert.ok(text.includes(manifest.preview.revision), `${route}: preview revision differs`);
}

console.log('Framework-doc version checks passed: preview identity, exact-version empty state, and matching HTML/Markdown/search/Agent revisions.');
