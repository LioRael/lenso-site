import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { verifyLinkedCatalog } from './linked-catalog.mjs';
import { documentSlug, ingestVerifiedDocuments } from './linked-documents.mjs';
import { verifyPortableCatalog } from './portable-catalog.mjs';
import { joinPortableReleaseDetails, verifyReleaseDetails } from './release-details.mjs';
import { checkpointConfig, loadCheckpointBundle, nextCheckpointBundle, stageCheckpointBundle } from './catalog-checkpoint-files.mjs';

const linkedUrl = process.env.LENSO_MARKETPLACE_LINKED_CARGO_URL;
const portableUrl = process.env.LENSO_MARKETPLACE_PORTABLE_URL;
const detailsUrl = process.env.LENSO_MARKETPLACE_RELEASE_DETAILS_URL;
const trustNames = [
  'LENSO_MARKETPLACE_CATALOG_ID',
  'LENSO_MARKETPLACE_KEY_ID',
  'LENSO_MARKETPLACE_PUBLIC_KEY_HEX',
];
const trustValues = trustNames.map((name) => process.env[name]);
if ([linkedUrl, portableUrl, detailsUrl, ...trustValues].some(Boolean)
  && (!(linkedUrl || portableUrl) || trustValues.some((value) => !value))) {
  throw new Error(`signed catalog build requires at least one snapshot URL and all of ${trustNames.join(', ')}`);
}
if (detailsUrl && !portableUrl) throw new Error('release details require the signed Portable base snapshot');
const trust = { catalogId: trustValues[0], keyId: trustValues[1], publicKeyHex: trustValues[2] };
const checkpoint = checkpointConfig(process.env, Boolean(linkedUrl || portableUrl));
const previous = checkpoint ? await loadCheckpointBundle(checkpoint, trust.catalogId) : null;
const now = Math.floor(Date.now() / 1000);

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
let portableCatalog = { catalogId: null, revision: null, expiresAt: null, detailsRevision: null, detailsExpiresAt: null, releases: [] };
const updates = {};
if (linkedUrl) {
  const linked = verifyLinkedCatalog(await fetchSnapshot(linkedUrl), trust, now, previous.bundle.linked_cargo);
  updates.linked_cargo = linked.checkpoint;
  catalog = { catalogId: linked.catalogId, revision: linked.revision,
    expiresAt: linked.expiresAt, releases: linked.releases };
}
if (portableUrl) {
  const portableBase = verifyPortableCatalog(await fetchSnapshot(portableUrl), trust, now, previous.bundle.portable);
  updates.portable = portableBase.checkpoint;
  let details;
  if (detailsUrl) {
    details = verifyReleaseDetails(await fetchSnapshot(detailsUrl), trust, now, previous.bundle.release_details);
    updates.release_details = details.checkpoint;
  }
  portableCatalog = details
    ? joinPortableReleaseDetails(portableBase, details)
    : { catalogId: portableBase.catalogId, revision: portableBase.revision,
      expiresAt: portableBase.expiresAt, detailsRevision: null, detailsExpiresAt: null,
      releases: portableBase.releases.map((release) => ({ ...release, documentation: [] })) };
  portableCatalog.releases = portableCatalog.releases.map((release) => ({ ...release,
    documentation: release.documentation.map((document) => ({ ...document,
      slug: documentSlug(release.pluginId, release.version, document, 'portable') })) }));
}
const allowedHosts = new Set((process.env.LENSO_MARKETPLACE_DOCUMENT_HOSTS ?? '')
  .split(',').map((host) => host.trim()).filter(Boolean));
for (const host of allowedHosts) {
  if (new URL(`https://${host}`).host !== host || host.includes('/')) {
    throw new Error('LENSO_MARKETPLACE_DOCUMENT_HOSTS must contain exact HTTPS host names');
  }
}
const documents = await ingestVerifiedDocuments([
  { catalog, channel: 'linked' }, { catalog: portableCatalog, channel: 'portable' },
], allowedHosts);
await mkdir(resolve(import.meta.dirname, '../lib/.generated'), { recursive: true });
await writeFile(resolve(import.meta.dirname, '../lib/.generated/linked-catalog.json'), `${JSON.stringify(catalog)}\n`);
await writeFile(resolve(import.meta.dirname, '../lib/.generated/portable-catalog.json'), `${JSON.stringify(portableCatalog)}\n`);
await writeFile(resolve(import.meta.dirname, '../lib/.generated/linked-documents.json'), `${JSON.stringify(documents)}\n`);
if (checkpoint) await stageCheckpointBundle(checkpoint,
  nextCheckpointBundle(previous.bundle, updates), previous.inputDigest);
console.log(`Signed Site catalogs: linked ${catalog.catalogId ? `${catalog.catalogId} revision ${catalog.revision} (${catalog.releases.length} listed releases)` : 'not configured'}; portable ${portableCatalog.catalogId ? `${portableCatalog.catalogId} revision ${portableCatalog.revision} (${portableCatalog.releases.length} listed releases)` : 'not configured'}; details ${portableCatalog.detailsRevision ?? 'not configured'}; verified Markdown ${Object.keys(documents).length}.`);
