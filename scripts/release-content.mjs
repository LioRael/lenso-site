import { createHash, createPublicKey, verify } from 'node:crypto';
import { releaseContentCheckpoint } from './catalog-checkpoints.mjs';
import { documentSlug } from './linked-documents.mjs';

const schema = 'lenso.marketplace.release-content.v2';
const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
const digest = /^sha256:[0-9a-f]{64}$/;
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

function base64(value) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('invalid release content base64');
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('noncanonical release content base64');
  return bytes;
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

function httpsUrl(value) {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > 2048 || value.includes('#')) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

function documentationValid(document) {
  const keys = ['id', 'revision', 'language', 'topic', 'url', 'digest', 'size', 'media_type'];
  if (document?.target !== undefined) keys.push('target');
  return exactKeys(document, keys) && boundedText(document.id, 128)
    && boundedText(document.revision, 128) && boundedText(document.language, 32)
    && boundedText(document.topic, 128)
    && (document.target === undefined || boundedText(document.target, 128))
    && httpsUrl(document.url) && digest.test(document.digest)
    && Number.isSafeInteger(document.size) && document.size > 0 && document.size <= 1024 * 1024
    && document.media_type === 'text/markdown';
}

function metadataValid(metadata) {
  return exactKeys(metadata, ['publisher_id', 'title', 'summary', 'source_url',
    'source_revision', 'license', 'documentation'])
    && boundedText(metadata.publisher_id, 128) && boundedText(metadata.title, 160)
    && boundedText(metadata.summary, 640) && boundedText(metadata.license, 128)
    && httpsUrl(metadata.source_url)
    && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(metadata.source_revision)
    && Array.isArray(metadata.documentation) && metadata.documentation.length >= 1
    && metadata.documentation.length <= 64
    && metadata.documentation.every(documentationValid)
    && metadata.documentation.some((document) => document.topic === 'getting-started')
    && new Set(metadata.documentation.map((document) =>
      JSON.stringify([document.id, document.revision]))).size === metadata.documentation.length;
}

function contentValid(content) {
  return exactKeys(content, ['id', 'kind', 'url', 'digest', 'size'])
    && typeof content.id === 'string' && /^[a-z][a-z0-9_-]{0,127}$/.test(content.id)
    && ['editable_template', 'development_extension'].includes(content.kind)
    && httpsUrl(content.url) && digest.test(content.digest)
    && Number.isSafeInteger(content.size) && content.size > 0 && content.size <= 16 * 1024 * 1024;
}

function contentOnlyIdentity(release) {
  const metadata = release.metadata;
  return `sha256:${createHash('sha256').update(JSON.stringify([
    release.plugin_id, release.version,
    [
      metadata.publisher_id, metadata.title, metadata.summary, metadata.source_url,
      metadata.source_revision, metadata.license,
      metadata.documentation.map((document) => [
        document.id, document.revision, document.language, document.topic,
        document.target ?? null, document.url, document.digest, document.size, document.media_type,
      ]),
    ],
    release.content.map((item) => [item.id, item.kind, item.url, item.digest, item.size]),
  ])).digest('hex')}`;
}

function releaseValid(release) {
  const keys = ['plugin_id', 'version', 'base_kind', 'base_release_identity', 'content'];
  if (release?.metadata !== undefined) keys.push('metadata');
  return exactKeys(release, keys)
    && pluginId(release.plugin_id) && version(release.version)
    && ['linked_cargo', 'portable', 'package', 'content_only'].includes(release.base_kind)
    && (release.base_kind === 'content_only'
      ? metadataValid(release.metadata) : release.metadata === undefined)
    && digest.test(release.base_release_identity)
    && Array.isArray(release.content) && release.content.length >= 1 && release.content.length <= 32
    && release.content.every(contentValid)
    && new Set(release.content.map((item) => item.id)).size === release.content.length
    && (release.base_kind !== 'content_only'
      || release.base_release_identity === contentOnlyIdentity(release));
}

export function verifyReleaseContent(raw, trust, now = Math.floor(Date.now() / 1000), previous = null) {
  if (!Buffer.isBuffer(raw) || raw.length > maxEnvelopeBytes) throw new Error('release content envelope exceeds limit');
  const envelope = JSON.parse(raw.toString('utf8'));
  if (!exactKeys(envelope, ['key_id', 'payload_base64', 'signature_base64'])) throw new Error('invalid release content envelope');
  if (!boundedText(envelope.key_id, 128) || envelope.key_id !== trust.keyId
    || !boundedText(trust.catalogId, 128) || !/^[0-9a-f]{64}$/.test(trust.publicKeyHex)) {
    throw new Error('release content trust mismatch');
  }
  const payload = base64(envelope.payload_base64);
  const signature = base64(envelope.signature_base64);
  if (signature.length !== 64) throw new Error('invalid release content signature');
  const publicKey = createPublicKey({ key: Buffer.concat([spkiPrefix, Buffer.from(trust.publicKeyHex, 'hex')]), format: 'der', type: 'spki' });
  const signed = Buffer.concat([Buffer.from(`${schema}\0${envelope.key_id}\0`), payload]);
  if (!verify(null, signed, publicKey, signature)) throw new Error('release content signature verification failed');
  const snapshot = JSON.parse(payload.toString('utf8'));
  if (!exactKeys(snapshot, ['schema', 'catalog_id', 'revision', 'issued_at', 'expires_at', 'releases'])
    || snapshot.schema !== schema || snapshot.catalog_id !== trust.catalogId
    || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1
    || !Number.isSafeInteger(snapshot.issued_at) || snapshot.issued_at < 0
    || !Number.isSafeInteger(snapshot.expires_at) || snapshot.expires_at <= snapshot.issued_at
    || snapshot.issued_at > now || snapshot.expires_at <= now
    || snapshot.expires_at - snapshot.issued_at > 604800
    || !Array.isArray(snapshot.releases) || snapshot.releases.length > 4096) {
    throw new Error('release content payload is not current or valid');
  }
  const identities = new Set();
  for (const release of snapshot.releases) {
    if (!releaseValid(release)) throw new Error('invalid signed release content');
    const identity = `${release.plugin_id}@${release.version}`;
    if (identities.has(identity)) throw new Error('duplicate signed release content identity');
    identities.add(identity);
  }
  const checkpoint = releaseContentCheckpoint(snapshot, payload, previous);
  return { catalogId: snapshot.catalog_id, revision: snapshot.revision,
    expiresAt: snapshot.expires_at, releases: snapshot.releases, checkpoint };
}

export function joinReleaseContent(linked, portable, content, packages = { catalogId: null, baseReleases: [], releases: [] }) {
  for (const catalog of [linked, portable, packages]) {
    if (catalog.catalogId && catalog.catalogId !== content.catalogId) throw new Error('release content catalog mismatch');
  }
  const bases = {
    linked_cargo: new Map((linked.baseReleases ?? []).map((release) => [`${release.pluginId}@${release.version}`, release.identity])),
    portable: new Map((portable.baseReleases ?? []).map((release) => [`${release.pluginId}@${release.version}`, release.identity])),
    package: new Map((packages.baseReleases ?? []).map((release) => [`${release.pluginId}@${release.version}`, release.identity])),
  };
  const listed = {
    linked_cargo: new Set(linked.releases.map((release) => `${release.pluginId}@${release.version}`)),
    portable: new Set(portable.releases.map((release) => `${release.pluginId}@${release.version}`)),
    package: new Set(packages.releases.map((release) => `${release.pluginId}@${release.version}`)),
  };
  const baseKeys = new Set([...bases.linked_cargo.keys(), ...bases.portable.keys(), ...bases.package.keys()]);
  const releases = [];
  for (const release of content.releases) {
    const key = `${release.plugin_id}@${release.version}`;
    if (release.base_kind === 'content_only') {
      if (baseKeys.has(key)) {
        throw new Error(`content_only identity collides with a published base release: ${key}`);
      }
      const identity = contentOnlyIdentity(release);
      if (identity !== release.base_release_identity) {
        throw new Error(`release content does not match immutable content_only release: ${key}`);
      }
      releases.push({
        pluginId: release.plugin_id, version: release.version, baseKind: release.base_kind,
        baseReleaseIdentity: identity, content: release.content.map((item) => ({ ...item })),
        metadata: {
          publisherId: release.metadata.publisher_id,
          title: release.metadata.title,
          summary: release.metadata.summary,
          sourceUrl: release.metadata.source_url,
          sourceRevision: release.metadata.source_revision,
          license: release.metadata.license,
          documentation: release.metadata.documentation.map((document) => ({
            ...document,
            slug: documentSlug(release.plugin_id, release.version, document, 'content'),
          })),
        },
      });
      continue;
    }
    const base = bases[release.base_kind].get(key);
    if (!base) continue;
    if (base !== release.base_release_identity) {
      throw new Error(`release content does not match immutable ${release.base_kind} base release: ${key}`);
    }
    if (listed[release.base_kind].has(key)) releases.push({
      pluginId: release.plugin_id, version: release.version, baseKind: release.base_kind,
      baseReleaseIdentity: release.base_release_identity,
      content: release.content.map((item) => ({ ...item })),
    });
  }
  return { catalogId: content.catalogId, revision: content.revision,
    expiresAt: content.expiresAt, releases };
}
