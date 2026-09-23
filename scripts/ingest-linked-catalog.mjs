import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifyLinkedCatalog } from './linked-catalog.mjs';

const output = resolve(import.meta.dirname, '../lib/.generated/linked-catalog.json');
const names = [
  'LENSO_MARKETPLACE_LINKED_CARGO_URL',
  'LENSO_MARKETPLACE_CATALOG_ID',
  'LENSO_MARKETPLACE_KEY_ID',
  'LENSO_MARKETPLACE_PUBLIC_KEY_HEX',
];
const values = names.map((name) => process.env[name]);
if (values.some(Boolean) && values.some((value) => !value)) {
  throw new Error(`linked catalog build requires all of ${names.join(', ')}`);
}

let catalog = { catalogId: null, revision: null, expiresAt: null, releases: [] };
if (values.every(Boolean)) {
  const url = new URL(values[0]);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('linked catalog build URL must be a plain HTTPS endpoint');
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000), redirect: 'error' });
  if (!response.ok) throw new Error(`linked catalog endpoint returned ${response.status}`);
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > 4 * 1024 * 1024) throw new Error('linked catalog response exceeds limit');
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 4 * 1024 * 1024) throw new Error('linked catalog response exceeds limit');
    chunks.push(chunk);
  }
  catalog = verifyLinkedCatalog(Buffer.concat(chunks), {
    catalogId: values[1], keyId: values[2], publicKeyHex: values[3],
  });
}
await mkdir(resolve(import.meta.dirname, '../lib/.generated'), { recursive: true });
await writeFile(output, `${JSON.stringify(catalog)}\n`);
console.log(catalog.catalogId
  ? `Verified linked catalog ${catalog.catalogId} revision ${catalog.revision} (${catalog.releases.length} listed releases)`
  : 'No linked catalog configured; signed Site results remain empty.');
