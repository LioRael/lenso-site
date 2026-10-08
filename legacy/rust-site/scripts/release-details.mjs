import { createPublicKey, verify } from 'node:crypto';
import { detailsCheckpoint } from './catalog-checkpoints.mjs';

// Mirrors lenso-plugin-catalog ReleaseDetailsSnapshot v1 for build-time
// browsing only. The caller must independently verify the base snapshot.
const schema = 'lenso.marketplace.release-details.v1';
const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
const maxEnvelopeBytes = 4 * 1024 * 1024;
const sha256 = /^sha256:[0-9a-f]{64}$/;

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
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password
      && !value.includes('#');
  } catch { return false; }
}
function version(value) {
  if (typeof value !== 'string' || value.length > 128) return false;
  const match = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(value);
  return Boolean(match) && !(match[1]?.split('.').some((part) => /^[0-9]+$/.test(part) && part.length > 1 && part.startsWith('0')));
}
function pluginId(value) {
  return typeof value === 'string' && value.length <= 253
    && value.split('.').length >= 2
    && value.split('.').every((label) => label.length <= 63 && /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(label));
}
function artifactValid(artifact) {
  return exactKeys(artifact, ['url', 'digest', 'size', 'manifest_digest'])
    && httpsUrl(artifact.url) && sha256.test(artifact.digest) && sha256.test(artifact.manifest_digest)
    && Number.isSafeInteger(artifact.size) && artifact.size > 0 && artifact.size <= 256 * 1024 * 1024;
}
function distributionValid(distribution, releaseVersion) {
  const keys = ['id', 'kind', 'package', 'version'];
  for (const optional of ['integrity', 'registry_url', 'artifact', 'targets']) {
    if (distribution?.[optional] !== undefined) keys.push(optional);
  }
  if (!exactKeys(distribution, keys) || !boundedText(distribution.id, 128)
    || !boundedText(distribution.package, 256) || !version(distribution.version)
    || distribution.version !== releaseVersion || !['portable_bundle', 'cargo_package', 'npm_package'].includes(distribution.kind)
    || (distribution.targets !== undefined && (!Array.isArray(distribution.targets)
      || distribution.targets.length > 32 || distribution.targets.some((target) => !boundedText(target, 128))
      || new Set(distribution.targets).size !== distribution.targets.length))) return false;
  if (distribution.kind === 'portable_bundle') {
    return distribution.integrity === undefined && distribution.registry_url === undefined
      && artifactValid(distribution.artifact);
  }
  const packageValid = distribution.kind === 'cargo_package'
    ? /^[a-z][a-z0-9_-]{0,63}$/.test(distribution.package)
    : /^(?:@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|[a-z0-9][a-z0-9._-]*)$/.test(distribution.package)
      && Buffer.byteLength(distribution.package, 'utf8') <= 214;
  return packageValid && distribution.artifact === undefined
    && httpsUrl(distribution.registry_url) && sha256.test(distribution.integrity ?? '');
}
function documentValid(document) {
  const keys = ['id', 'revision', 'language', 'topic', 'url', 'digest', 'size', 'media_type'];
  if (document?.target !== undefined) keys.push('target');
  return exactKeys(document, keys) && boundedText(document.id, 128)
    && boundedText(document.revision, 128) && boundedText(document.language, 32)
    && boundedText(document.topic, 128)
    && (document.target === undefined || boundedText(document.target, 128))
    && httpsUrl(document.url) && sha256.test(document.digest)
    && Number.isSafeInteger(document.size) && document.size > 0 && document.size <= 1024 * 1024
    && document.media_type === 'text/markdown';
}
function releaseValid(release) {
  if (!exactKeys(release, ['plugin_id', 'version', 'base_release_identity', 'distributions', 'documentation'])
    && !exactKeys(release, ['plugin_id', 'version', 'base_release_identity', 'distributions'])) return false;
  if (!pluginId(release.plugin_id) || !version(release.version)
    || !sha256.test(release.base_release_identity)
    || !Array.isArray(release.distributions) || release.distributions.length < 1 || release.distributions.length > 16
    || release.distributions.some((item) => !distributionValid(item, release.version))
    || new Set(release.distributions.map((item) => item.id)).size !== release.distributions.length) return false;
  const documents = release.documentation ?? [];
  return Array.isArray(documents) && documents.length <= 64
    && documents.every(documentValid)
    && new Set(documents.map((item) => `${item.id}@${item.revision}`)).size === documents.length;
}
function base64(value) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('invalid release details base64');
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('noncanonical release details base64');
  return bytes;
}

export function verifyReleaseDetails(raw, trust, now = Math.floor(Date.now() / 1000), previous = null) {
  if (!Buffer.isBuffer(raw) || raw.length > maxEnvelopeBytes) throw new Error('release details envelope exceeds limit');
  const envelope = JSON.parse(raw.toString('utf8'));
  if (!exactKeys(envelope, ['key_id', 'payload_base64', 'signature_base64'])) throw new Error('invalid release details envelope');
  if (!boundedText(envelope.key_id, 128) || envelope.key_id !== trust.keyId
    || !boundedText(trust.catalogId, 128) || !/^[0-9a-f]{64}$/.test(trust.publicKeyHex)) {
    throw new Error('release details trust mismatch');
  }
  const payload = base64(envelope.payload_base64);
  const signature = base64(envelope.signature_base64);
  if (signature.length !== 64) throw new Error('invalid release details signature');
  const publicKey = createPublicKey({ key: Buffer.concat([spkiPrefix, Buffer.from(trust.publicKeyHex, 'hex')]), format: 'der', type: 'spki' });
  const signed = Buffer.concat([Buffer.from(`${schema}\0${envelope.key_id}\0`), payload]);
  if (!verify(null, signed, publicKey, signature)) throw new Error('release details signature verification failed');
  const snapshot = JSON.parse(payload.toString('utf8'));
  if (!exactKeys(snapshot, ['schema', 'catalog_id', 'revision', 'issued_at', 'expires_at', 'releases'])
    || snapshot.schema !== schema || snapshot.catalog_id !== trust.catalogId
    || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1
    || !Number.isSafeInteger(snapshot.issued_at) || snapshot.issued_at < 0
    || !Number.isSafeInteger(snapshot.expires_at) || snapshot.expires_at < 0
    || snapshot.issued_at > now || snapshot.expires_at <= now
    || snapshot.expires_at - snapshot.issued_at > 604800
    || !Array.isArray(snapshot.releases) || snapshot.releases.length > 4096) {
    throw new Error('release details payload is not current or valid');
  }
  const identities = new Set();
  for (const release of snapshot.releases) {
    if (!releaseValid(release)) throw new Error('invalid signed release details');
    const identity = `${release.plugin_id}@${release.version}`;
    if (identities.has(identity)) throw new Error('duplicate signed release details identity');
    identities.add(identity);
  }
  const checkpoint = detailsCheckpoint(snapshot, payload, previous);
  return { catalogId: snapshot.catalog_id, revision: snapshot.revision,
    issuedAt: snapshot.issued_at, expiresAt: snapshot.expires_at,
    releases: snapshot.releases, checkpoint };
}

export function joinPortableReleaseDetails(portable, details) {
  if (portable.catalogId !== details.catalogId) throw new Error('release details catalog mismatch');
  const base = new Map(portable.baseReleases.map((release) => [`${release.pluginId}@${release.version}`, release]));
  const documentsByRelease = new Map();
  for (const release of details.releases) {
    const identity = `${release.plugin_id}@${release.version}`;
    const exact = base.get(identity);
    // This snapshot can contain other distributions. They are not Portable
    // documentation and must neither block nor populate this channel.
    if (!exact) continue;
    if (release.base_release_identity !== exact.identity
      || !release.distributions.some((distribution) => distribution.kind === 'portable_bundle'
        && distribution.artifact?.digest === exact.artifactDigest
        && distribution.artifact?.size === exact.artifactSize
        && distribution.artifact?.manifest_digest === exact.manifestDigest)) {
      throw new Error(`release details do not match immutable Portable base release: ${identity}`);
    }
    documentsByRelease.set(identity, release.documentation ?? []);
  }
  return {
    catalogId: portable.catalogId, revision: portable.revision, expiresAt: portable.expiresAt,
    detailsRevision: details.revision, detailsExpiresAt: details.expiresAt,
    releases: portable.releases.map((release) => ({ ...release,
      documentation: documentsByRelease.get(`${release.pluginId}@${release.version}`) ?? [] })),
  };
}
