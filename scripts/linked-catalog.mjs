import { createPublicKey, verify } from 'node:crypto';

const schema = 'lenso.marketplace.linked-cargo-snapshot.v1';
const context = Buffer.from(`${schema}\0`);
const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
const maxEnvelopeBytes = 4 * 1024 * 1024;

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, keys) {
  return object(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
}

function boundedText(value, max) {
  return typeof value === 'string' && value.trim().length > 0
    && Buffer.byteLength(value, 'utf8') <= max && !/[\p{Cc}]/u.test(value);
}

function httpsUrl(value) {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password && !url.hash;
  } catch { return false; }
}

function digest(value) {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function documentationValid(document) {
  return exactKeys(document, document?.target === undefined
    ? ['id', 'revision', 'language', 'topic', 'url', 'digest', 'size', 'media_type']
    : ['id', 'revision', 'language', 'topic', 'target', 'url', 'digest', 'size', 'media_type'])
    && boundedText(document.id, 128) && boundedText(document.revision, 128)
    && boundedText(document.language, 32) && boundedText(document.topic, 128)
    && (document.target === undefined || boundedText(document.target, 128))
    && httpsUrl(document.url) && digest(document.digest)
    && Number.isSafeInteger(document.size) && document.size > 0 && document.size <= 1024 * 1024
    && document.media_type === 'text/markdown';
}

function base64(value) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('invalid linked catalog base64');
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('noncanonical linked catalog base64');
  return bytes;
}

export function verifyLinkedCatalog(raw, trust, now = Math.floor(Date.now() / 1000)) {
  if (!Buffer.isBuffer(raw) || raw.length > maxEnvelopeBytes) throw new Error('linked catalog envelope exceeds limit');
  const envelope = JSON.parse(raw.toString('utf8'));
  if (!exactKeys(envelope, ['key_id', 'payload_base64', 'signature_base64'])) throw new Error('invalid linked catalog envelope');
  if (envelope.key_id !== trust.keyId || !/^[0-9a-f]{64}$/.test(trust.publicKeyHex)) throw new Error('linked catalog trust mismatch');
  const payload = base64(envelope.payload_base64);
  const signature = base64(envelope.signature_base64);
  if (signature.length !== 64) throw new Error('invalid linked catalog signature');
  const publicKey = createPublicKey({ key: Buffer.concat([spkiPrefix, Buffer.from(trust.publicKeyHex, 'hex')]), format: 'der', type: 'spki' });
  const signed = Buffer.concat([context, Buffer.from(envelope.key_id), Buffer.from([0]), payload]);
  if (!verify(null, signed, publicKey, signature)) throw new Error('linked catalog signature verification failed');
  const snapshot = JSON.parse(payload.toString('utf8'));
  if (!exactKeys(snapshot, ['schema', 'catalog_id', 'revision', 'issued_at', 'expires_at', 'releases'])
    || snapshot.schema !== schema || snapshot.catalog_id !== trust.catalogId
    || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1
    || !Number.isSafeInteger(snapshot.issued_at) || snapshot.issued_at < 0
    || !Number.isSafeInteger(snapshot.expires_at) || snapshot.expires_at < 0
    || snapshot.issued_at > now || snapshot.expires_at <= now
    || snapshot.expires_at - snapshot.issued_at > 604800
    || !Array.isArray(snapshot.releases) || snapshot.releases.length > 4096) {
    throw new Error('linked catalog payload is not current or valid');
  }
  const identities = new Set();
  for (const release of snapshot.releases) {
    if (!exactKeys(release, release?.documentation === undefined
      ? ['plugin_id', 'version', 'publisher_id', 'title', 'summary', 'source_url', 'source_revision', 'license', 'package', 'registry_url', 'crate_digest', 'integration', 'targets', 'availability']
      : ['plugin_id', 'version', 'publisher_id', 'title', 'summary', 'source_url', 'source_revision', 'license', 'package', 'registry_url', 'crate_digest', 'integration', 'targets', 'availability', 'documentation'])
      || !boundedText(release.plugin_id, 128) || !boundedText(release.version, 128)
      || !boundedText(release.publisher_id, 128) || !boundedText(release.title, 160)
      || !boundedText(release.summary, 640) || !boundedText(release.license, 128)
      || !httpsUrl(release.source_url) || !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(release.source_revision)
      || !boundedText(release.package, 128) || !httpsUrl(release.registry_url)
      || !digest(release.crate_digest)
      || !['listed', 'yanked', 'revoked'].includes(release.availability)
      || !['linked_plugin', 'host_provided'].includes(release.integration)
      || !Array.isArray(release.targets) || release.targets.length === 0 || release.targets.length > 32
      || release.targets.some((target) => !boundedText(target, 128))
      || new Set(release.targets).size !== release.targets.length
      || (release.documentation !== undefined && !Array.isArray(release.documentation))
      || (release.documentation ?? []).length > 64
      || (release.documentation ?? []).some((document) => !documentationValid(document))) {
      throw new Error('invalid linked catalog release');
    }
    const documents = (release.documentation ?? []).map((document) => `${document.id}\0${document.revision}`);
    if (new Set(documents).size !== documents.length) throw new Error('duplicate linked catalog document revision');
    const identity = `${release.plugin_id}@${release.version}`;
    if (identities.has(identity)) throw new Error('duplicate linked catalog release');
    identities.add(identity);
  }
  return {
    catalogId: snapshot.catalog_id,
    revision: snapshot.revision,
    expiresAt: snapshot.expires_at,
    releases: snapshot.releases.filter((release) => release.availability === 'listed').map((release) => ({
      pluginId: release.plugin_id,
      version: release.version,
      title: release.title,
      summary: release.summary,
      package: release.package,
      integration: release.integration,
      targets: release.targets,
      crateDigest: release.crate_digest,
      documentation: release.documentation ?? [],
    })),
  };
}
