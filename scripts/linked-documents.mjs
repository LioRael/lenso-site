import { createHash } from 'node:crypto';

const maxDocuments = 512;
const maxTotalBytes = 32 * 1024 * 1024;

export function documentSlug(pluginId, version, document, channel = 'linked') {
  if (!['linked', 'portable', 'package', 'linked_details'].includes(channel)) throw new Error('unknown signed documentation channel');
  const digest = createHash('sha256')
    .update(`${pluginId}\0${version}\0${document.id}\0${document.revision}`)
    .digest('hex');
  // Existing linked URLs stay stable. Additive details and other signed
  // channels cannot collide on the same Plugin/version/document identity.
  return channel === 'linked' ? digest : `${channel}-${digest}`;
}

/** Fetch only operator-approved hosts and persist nothing until every body verifies. */
export async function ingestVerifiedDocuments(catalogs, allowedHosts, fetcher = fetch) {
  const selected = catalogs.flatMap(({ catalog, channel }) => catalog.releases.flatMap((release) =>
    release.documentation.map((document) => ({ channel, release, document }))));
  if (selected.some(({ document }) => !Number.isSafeInteger(document.size)
    || document.size < 1 || document.size > 1024 * 1024
    || !/^sha256:[0-9a-f]{64}$/.test(document.digest))) {
    throw new Error('signed documentation size or digest is invalid');
  }
  if (selected.length > maxDocuments || selected.reduce((sum, { document }) => sum + document.size, 0) > maxTotalBytes) {
    throw new Error('signed documentation exceeds Site build limits');
  }
  if (selected.length > 0 && allowedHosts.size === 0) {
    throw new Error('LENSO_MARKETPLACE_DOCUMENT_HOSTS is required for signed documentation');
  }
  const result = {};
  for (const { channel, release, document } of selected) {
    const url = new URL(document.url);
    if (url.protocol !== 'https:' || url.username || url.password || url.hash || !allowedHosts.has(url.host)) {
      throw new Error(`signed documentation host is not approved: ${url.host}`);
    }
    const response = await fetcher(url, { signal: AbortSignal.timeout(10_000), redirect: 'error' });
    if (!response.ok || !response.body || response.redirected
      || (response.url && response.url !== url.toString())) {
      throw new Error(`signed documentation fetch failed or redirected: ${response.status}`);
    }
    const advertised = Number(response.headers.get('content-length'));
    if (Number.isFinite(advertised) && advertised > document.size) throw new Error('signed documentation exceeds declared size');
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > document.size) throw new Error('signed documentation exceeds declared size');
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (bytes.length !== document.size) throw new Error('signed documentation size mismatch');
    const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
    if (digest !== document.digest) throw new Error('signed documentation digest mismatch');
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const slug = documentSlug(release.pluginId, release.version, document, channel);
    if (result[slug]) throw new Error('duplicate signed documentation identity');
    result[slug] = {
      pluginId: release.pluginId,
      version: release.version,
      channel,
      slug,
      documentId: document.id,
      revision: document.revision,
      language: document.language,
      topic: document.topic,
      target: document.target ?? null,
      sourceUrl: document.url,
      digest,
      content,
    };
  }
  return result;
}

export async function ingestLinkedDocuments(catalog, allowedHosts, fetcher = fetch) {
  return ingestVerifiedDocuments([{ catalog, channel: 'linked' }], allowedHosts, fetcher);
}
