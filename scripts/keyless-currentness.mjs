export const canonicalCurrentUrl = 'https://marketplace.lenso.dev/api/marketplace/v3/current';

export function matchesVerifiedHead(head, provenance) {
  return head?.schema === 'lenso.marketplace.keyless-current.v1'
    && head.catalog_id === 'lenso-official-v2' && head.catalog_id === provenance.catalogId
    && head.revision === provenance.revision && head.catalog?.sha256 === provenance.catalogDigest
    && head.catalog.path === `/api/marketplace/v3/objects/${provenance.catalogDigest}.json`
    && head.catalog.size === provenance.catalogSize
    && head.bundle?.sha256 === provenance.bundleDigest && head.bundle.size === provenance.bundleSize
    && head.bundle.path === `/api/marketplace/v3/objects/${provenance.bundleDigest}.json`
    && head.provenance?.source_sha === provenance.sourceSha
    && head.provenance.repository === 'LioRael/lenso-marketplace'
    && head.provenance.workflow === '.github/workflows/publish-keyless-catalog.yml'
    && head.provenance.ref === 'refs/heads/main';
}

export async function confirmVerifiedHead(provenance, fetcher = fetch) {
  try {
    const response = await fetcher(canonicalCurrentUrl, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(5000) });
    if (!response.ok || !response.body) return false;
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 8192) return false;
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return matchesVerifiedHead(JSON.parse(new TextDecoder().decode(bytes)), provenance);
  } catch { return false; }
}

export function marketplaceCommand(command) {
  const source = /^lenso app add ([a-z0-9.-]+@[0-9A-Za-z.+-]+)/u.exec(command);
  if (!source) throw new Error('Unsupported marketplace command');
  const flags = command.match(/ --(?:distribution|content-id|content-destination) (?:'(?:[^'\r\n]|'\\'')*'|[a-z0-9./_-]+)| --content-preview/gu) ?? [];
  return `lenso app add ${source[1]} --marketplace${flags.join('')}`;
}
