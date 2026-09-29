import { createPublicKey, verify } from 'node:crypto';
import { portableCheckpoint } from './catalog-checkpoints.mjs';

// Mirrors the public lenso-plugin-catalog Snapshot v1 wire contract. This
// verifies display data only; installation must verify the snapshot again.
const schema = 'lenso.marketplace.snapshot.v1';
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

function plainText(value, max) {
  return typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= max
    && ![...value].some((char) => /\p{Cc}/u.test(char) && !'\n\r\t'.includes(char));
}

function httpsUrl(value) {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password
      && !value.includes('#');
  } catch { return false; }
}

function digest(value) {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function pluginId(value) {
  return typeof value === 'string' && value.length <= 253
    && value.split('.').length >= 2
    && value.split('.').every((label) => label.length <= 63 && /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(label));
}

function version(value) {
  if (typeof value !== 'string' || value.length > 128) return false;
  const match = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(value);
  return Boolean(match) && !(match[1]?.split('.').some((part) => /^[0-9]+$/.test(part) && part.length > 1 && part.startsWith('0')));
}

function artifactValid(artifact) {
  return exactKeys(artifact, ['url', 'digest', 'size', 'manifest_digest'])
    && httpsUrl(artifact.url) && digest(artifact.digest) && digest(artifact.manifest_digest)
    && Number.isSafeInteger(artifact.size) && artifact.size > 0 && artifact.size <= 256 * 1024 * 1024;
}

function presentationValid(presentation) {
  if (presentation === undefined || presentation === null) return true;
  const keys = ['screenshots', 'getting_started'];
  if (presentation.icon_url !== undefined) keys.push('icon_url');
  if (presentation.screenshots === undefined) keys.splice(keys.indexOf('screenshots'), 1);
  if (presentation.getting_started === undefined) keys.splice(keys.indexOf('getting_started'), 1);
  return exactKeys(presentation, keys)
    && (presentation.icon_url === undefined || httpsUrl(presentation.icon_url))
    && (presentation.getting_started === undefined || plainText(presentation.getting_started, 16_384))
    && (presentation.screenshots === undefined || (Array.isArray(presentation.screenshots)
      && presentation.screenshots.length <= 6
      && presentation.screenshots.every((item) => exactKeys(item, ['url', 'caption'])
        && httpsUrl(item.url) && boundedText(item.caption, 320))
      && new Set(presentation.screenshots.map((item) => item.url)).size === presentation.screenshots.length));
}

function releaseValid(release) {
  const keys = ['plugin_id', 'version', 'publisher_id', 'title', 'summary', 'source_url', 'source_revision', 'license', 'artifact', 'availability'];
  if (release?.description !== undefined) keys.push('description');
  if (release?.presentation !== undefined) keys.push('presentation');
  return exactKeys(release, keys) && pluginId(release.plugin_id) && version(release.version)
    && boundedText(release.publisher_id, 128) && boundedText(release.title, 160)
    && boundedText(release.summary, 2048) && boundedText(release.license, 128)
    && (release.description === undefined || plainText(release.description, 16_384))
    && presentationValid(release.presentation)
    && httpsUrl(release.source_url) && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(release.source_revision)
    && artifactValid(release.artifact)
    && ['listed', 'yanked', 'revoked'].includes(release.availability);
}

function base64(value) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('invalid portable catalog base64');
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('noncanonical portable catalog base64');
  return bytes;
}

export function verifyPortableCatalog(raw, trust, now = Math.floor(Date.now() / 1000), previous = null) {
  if (!Buffer.isBuffer(raw) || raw.length > maxEnvelopeBytes) throw new Error('portable catalog envelope exceeds limit');
  const envelope = JSON.parse(raw.toString('utf8'));
  if (!exactKeys(envelope, ['key_id', 'payload_base64', 'signature_base64'])) throw new Error('invalid portable catalog envelope');
  if (!boundedText(envelope.key_id, 128) || envelope.key_id !== trust.keyId
    || !boundedText(trust.catalogId, 128) || !/^[0-9a-f]{64}$/.test(trust.publicKeyHex)) {
    throw new Error('portable catalog trust mismatch');
  }
  const payload = base64(envelope.payload_base64);
  const signature = base64(envelope.signature_base64);
  if (signature.length !== 64) throw new Error('invalid portable catalog signature');
  const publicKey = createPublicKey({ key: Buffer.concat([spkiPrefix, Buffer.from(trust.publicKeyHex, 'hex')]), format: 'der', type: 'spki' });
  const signed = Buffer.concat([context, Buffer.from(envelope.key_id), Buffer.from([0]), payload]);
  if (!verify(null, signed, publicKey, signature)) throw new Error('portable catalog signature verification failed');
  const snapshot = JSON.parse(payload.toString('utf8'));
  if (!exactKeys(snapshot, ['schema', 'catalog_id', 'revision', 'issued_at', 'expires_at', 'releases'])
    || snapshot.schema !== schema || snapshot.catalog_id !== trust.catalogId
    || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1
    || !Number.isSafeInteger(snapshot.issued_at) || snapshot.issued_at < 0
    || !Number.isSafeInteger(snapshot.expires_at) || snapshot.expires_at < 0
    || snapshot.issued_at > now || snapshot.expires_at <= now
    || snapshot.expires_at - snapshot.issued_at > 604800
    || !Array.isArray(snapshot.releases) || snapshot.releases.length > 4096) {
    throw new Error('portable catalog payload is not current or valid');
  }
  validatePortableRecords(snapshot.releases);
  const checkpoint = portableCheckpoint(snapshot, payload, previous);
  return {
    catalogId: snapshot.catalog_id,
    revision: snapshot.revision,
    expiresAt: snapshot.expires_at,
    checkpoint,
    // Keep all identities only in build memory so signed details can be checked
    // against yanked/revoked history without displaying those releases.
    baseReleases: snapshot.releases.map((release) => ({
      pluginId: release.plugin_id,
      version: release.version,
      identity: checkpoint.release_identities[`${release.plugin_id}@${release.version}`],
      artifactDigest: release.artifact.digest,
      artifactSize: release.artifact.size,
      manifestDigest: release.artifact.manifest_digest,
    })),
    releases: snapshot.releases.filter((release) => release.availability === 'listed').map((release) => ({
      pluginId: release.plugin_id,
      version: release.version,
      title: release.title,
      summary: release.summary,
      publisherId: release.publisher_id,
      sourceUrl: release.source_url,
      sourceRevision: release.source_revision,
      license: release.license,
      artifactUrl: release.artifact.url,
      artifactDigest: release.artifact.digest,
      artifactSize: release.artifact.size,
      manifestDigest: release.artifact.manifest_digest,
    })),
  };
}

// Record schema admission only; callers must separately verify catalog provenance.
export function validatePortableRecords(releases) {
  if (!Array.isArray(releases) || releases.length > 4096) throw new Error('Record collection exceeds limit');
  const identities = new Set();
  for (const release of releases) {
    if (!releaseValid(release)) throw new Error('invalid portable catalog release');
    const identity = `${release.plugin_id}@${release.version}`;
    if (identities.has(identity)) throw new Error('duplicate portable catalog release');
    identities.add(identity);
  }
}
