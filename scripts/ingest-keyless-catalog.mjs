import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fetchVerifiedCatalog, normalizeCatalog } from './keyless-catalog.mjs';
import { keylessCheckpointConfig, loadKeylessCheckpoint, stageKeylessCheckpoint } from './keyless-checkpoint.mjs';
import { ingestVerifiedDocuments } from './linked-documents.mjs';

export async function ingestKeylessCatalog(env = process.env) {
  if (Object.keys(env).some((name) => /^LENSO_MARKETPLACE_(?:LINKED_CARGO_URL|PORTABLE_URL|PACKAGE_URL|RELEASE_DETAILS_URL|RELEASE_CONTENT_URL|CHECKPOINT_)/u.test(name) && env[name])) {
    throw new Error('Keyless and legacy build inputs cannot be mixed');
  }
  const config = keylessCheckpointConfig(env);
  const { previous, inputDigest } = await loadKeylessCheckpoint(config);
  const { catalog, checkpoint, head } = await fetchVerifiedCatalog(previous);
  const normalized = normalizeCatalog(catalog, head);
  const hosts = new Set((env.LENSO_MARKETPLACE_DOCUMENT_HOSTS ?? '').split(',').map((host) => host.trim()).filter(Boolean));
  for (const host of hosts) {
    if (new URL(`https://${host}`).host !== host || host.includes('/')) throw new Error('Document hosts must be exact HTTPS host names');
  }
  const documents = await ingestVerifiedDocuments([
    { catalog: normalized.linked, channel: 'linked' }, { catalog: normalized.portable, channel: 'portable' },
    { catalog: normalized.package, channel: 'package' },
    { catalog: { releases: normalized.content.releases.map((release) => release.metadata) }, channel: 'content' },
  ], hosts);
  const directory = resolve(import.meta.dirname, '../lib/.generated');
  await mkdir(directory, { recursive: true });
  for (const [file, data] of Object.entries({ 'linked-catalog': normalized.linked, 'portable-catalog': normalized.portable,
    'package-catalog': normalized.package, 'release-content': normalized.content, 'linked-documents': documents })) {
    await writeFile(resolve(directory, `${file}.json`), `${JSON.stringify(data)}\n`);
  }
  await stageKeylessCheckpoint(config, checkpoint, inputDigest);
  console.log(`Verified keyless Site catalog ${head.catalog_id} revision ${head.revision}; ${catalog.releases.length} historical releases.`);
}
