import { createPublicKey, verify } from 'node:crypto';
import { packageCheckpoint } from './catalog-checkpoints.mjs';
import { documentSlug } from './linked-documents.mjs';

const schema = 'lenso.marketplace.package-snapshot.v1';
const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
const sha256 = /^sha256:[0-9a-f]{64}$/;
const maxEnvelopeBytes = 4 * 1024 * 1024;

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => object(value)
  && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
const boundedText = (value, max) => typeof value === 'string' && value.trim().length > 0
  && Buffer.byteLength(value, 'utf8') <= max && !/[\p{Cc}]/u.test(value);

function base64(value) {
  if (typeof value !== 'string'
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('invalid package catalog base64');
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('noncanonical package catalog base64');
  return bytes;
}

function httpsUrl(value) {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > 2048 || value.includes('#')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
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

function npmName(value) {
  if (typeof value !== 'string' || value.length > 214) return false;
  const segment = (part) => part.length > 0 && !/^[._]/.test(part) && /^[a-z0-9._-]+$/.test(part);
  if (value.startsWith('@')) {
    const parts = value.slice(1).split('/');
    return parts.length === 2 && parts.every(segment);
  }
  return !value.includes('/') && segment(value);
}

function distributionValid(distribution) {
  const keys = ['id', 'kind', 'package', 'version', 'integrity', 'registry_url'];
  if (distribution?.targets !== undefined) keys.push('targets');
  return exactKeys(distribution, keys) && boundedText(distribution.id, 128)
    && distribution.kind === 'npm_package' && npmName(distribution.package)
    && version(distribution.version) && sha256.test(distribution.integrity)
    && httpsUrl(distribution.registry_url)
    && (distribution.targets === undefined || (Array.isArray(distribution.targets)
      && distribution.targets.length <= 32
      && distribution.targets.every((target) => boundedText(target, 128))
      && new Set(distribution.targets).size === distribution.targets.length));
}

function documentationValid(document) {
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
  const keys = ['plugin_id', 'version', 'publisher_id', 'title', 'summary',
    'source_url', 'source_revision', 'license', 'distributions', 'availability'];
  if (release?.documentation !== undefined) keys.push('documentation');
  return exactKeys(release, keys) && pluginId(release.plugin_id) && version(release.version)
    && boundedText(release.publisher_id, 128) && boundedText(release.title, 160)
    && boundedText(release.summary, 640) && boundedText(release.license, 128)
    && httpsUrl(release.source_url) && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(release.source_revision)
    && Array.isArray(release.distributions) && release.distributions.length >= 1
    && release.distributions.length <= 16 && release.distributions.every(distributionValid)
    && new Set(release.distributions.map((item) => item.id)).size === release.distributions.length
    && ['listed', 'yanked', 'revoked'].includes(release.availability)
    && (release.documentation === undefined || (Array.isArray(release.documentation)
      && release.documentation.length <= 64
      && release.documentation.every(documentationValid)
      && new Set(release.documentation.map((item) => JSON.stringify([item.id, item.revision]))).size
        === release.documentation.length));
}

export function verifyPackageCatalog(raw, trust, now = Math.floor(Date.now() / 1000), previous = null) {
  if (!Buffer.isBuffer(raw) || raw.length > maxEnvelopeBytes) throw new Error('package catalog envelope exceeds limit');
  const envelope = JSON.parse(raw.toString('utf8'));
  if (!exactKeys(envelope, ['key_id', 'payload_base64', 'signature_base64'])) {
    throw new Error('invalid package catalog envelope');
  }
  if (!boundedText(envelope.key_id, 128) || envelope.key_id !== trust.keyId
    || !boundedText(trust.catalogId, 128) || !/^[0-9a-f]{64}$/.test(trust.publicKeyHex)) {
    throw new Error('package catalog trust mismatch');
  }
  const payload = base64(envelope.payload_base64);
  const signature = base64(envelope.signature_base64);
  if (signature.length !== 64) throw new Error('invalid package catalog signature');
  const publicKey = createPublicKey({
    key: Buffer.concat([spkiPrefix, Buffer.from(trust.publicKeyHex, 'hex')]), format: 'der', type: 'spki',
  });
  const signed = Buffer.concat([Buffer.from(`${schema}\0${envelope.key_id}\0`), payload]);
  if (!verify(null, signed, publicKey, signature)) throw new Error('package catalog signature verification failed');
  const snapshot = JSON.parse(payload.toString('utf8'));
  if (!exactKeys(snapshot, ['schema', 'catalog_id', 'revision', 'issued_at', 'expires_at', 'releases'])
    || snapshot.schema !== schema || snapshot.catalog_id !== trust.catalogId
    || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1
    || !Number.isSafeInteger(snapshot.issued_at) || snapshot.issued_at < 0
    || !Number.isSafeInteger(snapshot.expires_at) || snapshot.expires_at <= snapshot.issued_at
    || snapshot.issued_at > now || snapshot.expires_at <= now
    || snapshot.expires_at - snapshot.issued_at > 604800
    || !Array.isArray(snapshot.releases) || snapshot.releases.length > 4096) {
    throw new Error('package catalog payload is not current or valid');
  }
  validatePackageRecords(snapshot.releases);
  const checkpoint = packageCheckpoint(snapshot, payload, previous);
  return {
    catalogId: snapshot.catalog_id,
    revision: snapshot.revision,
    expiresAt: snapshot.expires_at,
    checkpoint,
    baseReleases: snapshot.releases.map((release) => ({
      pluginId: release.plugin_id, version: release.version,
      identity: checkpoint.release_identities[`${release.plugin_id}@${release.version}`],
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
      distributions: release.distributions.map((item) => ({
        id: item.id, kind: item.kind, package: item.package, version: item.version,
        integrity: item.integrity, registryUrl: item.registry_url, targets: item.targets ?? [],
      })),
      documentation: (release.documentation ?? []).map((document) => ({
        ...document, slug: documentSlug(release.plugin_id, release.version, document, 'package'),
      })),
    })),
  };
}

// Record schema admission only; callers must separately verify catalog provenance.
export function validatePackageRecords(releases) {
  if (!Array.isArray(releases) || releases.length > 4096) throw new Error('Record collection exceeds limit');
  const identities = new Set();
  for (const release of releases) {
    if (!releaseValid(release)) throw new Error('invalid package catalog release');
    const identity = `${release.plugin_id}@${release.version}`;
    if (identities.has(identity)) throw new Error('duplicate package catalog release');
    identities.add(identity);
  }
}
