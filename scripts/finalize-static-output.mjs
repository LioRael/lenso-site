import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { walkFiles } from './docs-files.mjs';

const outputRoot = join(process.cwd(), 'out');
const chineseRoot = join(outputRoot, 'docs', 'zh');

for (const file of walkFiles(chineseRoot).filter((candidate) => candidate.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const localized = html.replace('<html lang="en"', '<html lang="zh-CN"');
  if (localized === html) throw new Error(`${file}: expected an English root language marker`);
  writeFileSync(file, localized);
}

console.log('Finalized static output: Simplified Chinese documents declare lang="zh-CN".');
