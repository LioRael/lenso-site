import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { walkFiles } from './docs-files.mjs';

const outputRoot = join(process.cwd(), 'out');
const chineseRoot = join(outputRoot, 'docs', 'zh');
const signedDocuments = JSON.parse(readFileSync(join(process.cwd(), 'lib/.generated/linked-documents.json'), 'utf8'));

if (Object.keys(signedDocuments).length === 0) {
  for (const path of [
    join(outputRoot, 'plugins', '_no-signed-document'),
    join(outputRoot, 'api', 'plugins', '_no-signed-document'),
  ]) {
    if (existsSync(path)) rmSync(path, { recursive: true });
  }
}

for (const file of walkFiles(chineseRoot).filter((candidate) => candidate.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const localized = html.replace('<html lang="en"', '<html lang="zh-CN"');
  if (localized === html) throw new Error(`${file}: expected an English root language marker`);
  writeFileSync(file, localized);
}

console.log('Finalized static output: Simplified Chinese documents declare lang="zh-CN"; no unsigned document placeholder is published.');
