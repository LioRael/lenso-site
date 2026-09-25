import { copyFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { walkFiles } from './docs-files.mjs';

const outputRoot = join(process.cwd(), 'out');
const chineseRoot = join(outputRoot, 'docs', 'zh');
const signedDocuments = JSON.parse(readFileSync(join(process.cwd(), 'lib/.generated/linked-documents.json'), 'utf8'));
const linkedCatalog = JSON.parse(readFileSync(join(process.cwd(), 'lib/.generated/linked-catalog.json'), 'utf8'));
const portableCatalog = JSON.parse(readFileSync(join(process.cwd(), 'lib/.generated/portable-catalog.json'), 'utf8'));
const packageCatalog = JSON.parse(readFileSync(join(process.cwd(), 'lib/.generated/package-catalog.json'), 'utf8'));

if (Object.keys(signedDocuments).length === 0) {
  for (const path of [
    join(outputRoot, 'plugins', '_no-signed-document'),
    join(outputRoot, 'api', 'plugins', '_no-signed-document'),
  ]) {
    if (existsSync(path)) rmSync(path, { recursive: true });
  }
}
if (linkedCatalog.releases.length === 0 && portableCatalog.releases.length === 0 && packageCatalog.releases.length === 0) {
  const placeholder = join(outputRoot, 'api', 'plugins', 'releases', '_no-signed-release');
  if (existsSync(placeholder)) rmSync(placeholder, { recursive: true });
}

for (const file of walkFiles(chineseRoot).filter((candidate) => candidate.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const localized = html.replace('<html lang="en"', '<html lang="zh-CN"');
  if (localized === html) throw new Error(`${file}: expected an English root language marker`);
  writeFileSync(file, localized);
}

const pluginRoot = join(outputRoot, 'plugins');
for (const file of walkFiles(pluginRoot)) {
  const parts = relative(pluginRoot, file).split(sep);
  if (parts.length !== 3 || parts[2] !== 'index.txt') continue;
  const [pluginId, version] = parts;
  copyFileSync(file, join(pluginRoot, pluginId, `${version}.txt`));
}

console.log('Finalized static output: Simplified Chinese documents declare lang="zh-CN"; no unsigned release or document placeholder is published.');
