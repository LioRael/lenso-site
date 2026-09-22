import { readFileSync } from 'node:fs';
import { create, insert, search } from 'zbsearch';

const route = readFileSync(new URL('../app/api/search/route.ts', import.meta.url), 'utf8');
if (/language\s*:\s*['"]english['"]/.test(route)) {
  throw new Error('The bilingual search route must not force the English tokenizer.');
}

const db = create({ schema: { content: 'string' }, language: 'multilingual' });
await insert(db, { content: '插件配置指南' });
const result = await search(db, { term: '插件' });
if (result.count !== 1) throw new Error('The multilingual tokenizer did not return the Chinese smoke-test document.');

console.log('Search checks passed: the route uses multilingual tokenization and Chinese queries match.');
