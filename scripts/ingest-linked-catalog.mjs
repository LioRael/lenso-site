import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifyLinkedCatalog } from './linked-catalog.mjs';
import { ingestLinkedDocuments } from './linked-documents.mjs';
import { verifyPortableCatalog } from './portable-catalog.mjs';

const linkedUrl = process.env.LENSO_MARKETPLACE_LINKED_CARGO_URL;
const portableUrl = process.env.LENSO_MARKETPLACE_PORTABLE_URL;
const trustNames = [
  'LENSO_MARKETPLACE_CATALOG_ID',
  'LENSO_MARKETPLACE_KEY_ID',
  'LENSO_MARKETPLACE_PUBLIC_KEY_HEX',
];
const trustValues = trustNames.map((name) => process.env[name]);
if ([linkedUrl, portableUrl, ...trustValues].some(Boolean)
  && (!(linkedUrl || portableUrl) || trustValues.some((value) => !value))) {
  throw new Error(`signed catalog build requires at least one snapshot URL and all of ${trustNames.join(', ')}`);
}
const trust = { catalogId: trustValues[0], keyId: trustValues[1], publicKeyHex: trustValues[2] };

async function fetchSnapshot(endpoint) {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('signed catalog build URL must be a plain HTTPS endpoint');
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000), redirect: 'error' });
  if (!response.ok) throw new Error(`signed catalog endpoint returned ${response.status}`);
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > 4 * 1024 * 1024) throw new Error('signed catalog response exceeds limit');
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 4 * 1024 * 1024) throw new Error('signed catalog response exceeds limit');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

let catalog = { catalogId: null, revision: null, expiresAt: null, releases: [] };
let portableCatalog = { catalogId: null, revision: null, expiresAt: null, releases: [] };
if (linkedUrl) catalog = verifyLinkedCatalog(await fetchSnapshot(linkedUrl), trust);
if (portableUrl) portableCatalog = verifyPortableCatalog(await fetchSnapshot(portableUrl), trust);
const allowedHosts = new Set((process.env.LENSO_MARKETPLACE_DOCUMENT_HOSTS ?? '')
  .split(',').map((host) => host.trim()).filter(Boolean));
for (const host of allowedHosts) {
  if (new URL(`https://${host}`).host !== host || host.includes('/')) {
    throw new Error('LENSO_MARKETPLACE_DOCUMENT_HOSTS must contain exact HTTPS host names');
  }
}
const documents = await ingestLinkedDocuments(catalog, allowedHosts);
await mkdir(resolve(import.meta.dirname, '../lib/.generated'), { recursive: true });
await writeFile(resolve(import.meta.dirname, '../lib/.generated/linked-catalog.json'), `${JSON.stringify(catalog)}\n`);
await writeFile(resolve(import.meta.dirname, '../lib/.generated/portable-catalog.json'), `${JSON.stringify(portableCatalog)}\n`);
await writeFile(resolve(import.meta.dirname, '../lib/.generated/linked-documents.json'), `${JSON.stringify(documents)}\n`);
console.log(`Signed Site catalogs: linked ${catalog.catalogId ? `${catalog.catalogId} revision ${catalog.revision} (${catalog.releases.length} listed releases, ${Object.keys(documents).length} documents)` : 'not configured'}; portable ${portableCatalog.catalogId ? `${portableCatalog.catalogId} revision ${portableCatalog.revision} (${portableCatalog.releases.length} listed releases)` : 'not configured'}.`);
