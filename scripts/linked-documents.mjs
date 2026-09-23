import { createHash } from 'node:crypto';

const maxDocuments = 512;
const maxTotalBytes = 32 * 1024 * 1024;

export function documentSlug(pluginId, version, document) {
  return createHash('sha256')
    .update(`${pluginId}\0${version}\0${document.id}\0${document.revision}`)
    .digest('hex');
}

/** Fetch only operator-approved hosts and persist nothing until every body verifies. */
export async function ingestLinkedDocuments(catalog, allowedHosts, fetcher = fetch) {
  const selected = catalog.releases.flatMap((release) => release.documentation.map((document) => ({
    release, document,
  })));
  if (selected.length > maxDocuments || selected.reduce((sum, { document }) => sum + document.size, 0) > maxTotalBytes) {
    throw new Error('signed linked documentation exceeds Site build limits');
  }
  if (selected.length > 0 && allowedHosts.size === 0) {
    throw new Error('LENSO_MARKETPLACE_DOCUMENT_HOSTS is required for signed documentation');
  }
  const result = {};
  for (const { release, document } of selected) {
    const url = new URL(document.url);
    if (url.protocol !== 'https:' || !allowedHosts.has(url.host)) {
      throw new Error(`signed documentation host is not approved: ${url.host}`);
    }
    const response = await fetcher(url, { signal: AbortSignal.timeout(10_000), redirect: 'error' });
    if (!response.ok || !response.body) throw new Error(`signed documentation fetch failed: ${response.status}`);
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
    const slug = documentSlug(release.pluginId, release.version, document);
    if (result[slug]) throw new Error('duplicate signed documentation identity');
    result[slug] = {
      pluginId: release.pluginId,
      version: release.version,
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
