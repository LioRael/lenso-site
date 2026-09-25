import { createPublicKey, verify } from 'node:crypto';
import { packageCheckpoint } from './catalog-checkpoints.mjs';
import { documentSlug } from './linked-documents.mjs';

const schema = 'lenso.marketplace.package-snapshot.v1';
const context = Buffer.from(`${schema}\0`);
const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
const maxEnvelopeBytes = 4 * 1024 * 1024;
const sha256 = /^sha256:[0-9a-f]{64}$/;

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => object(value)
  && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
const boundedText = (value, max) => typeof value === 'string' && value.trim().length > 0
  && Buffer.byteLength(value, 'utf8') <= max && !/\p{Cc}/u.test(value);

function httpsUrl(value) {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password && !url.hash;
  } catch { return false; }
}

function version(value) {
  if (typeof value !== 'string' || value.length > 128) return false;
  const match = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(value);
  return Boolean(match)
    && match.slice(1, 4).every((part) => BigInt(part) <= 18_446_744_073_709_551_615n)
    && !(match[4]?.split('.').some((part) => /^[0-9]+$/.test(part) && part.length > 1 && part.startsWith('0')));
}

function pluginId(value) {
  return typeof value === 'string' && value.length <= 253 && value.split('.').length >= 2
    && value.split('.').every((label) => label.length <= 63 && /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(label));
}

function npmPackage(value) {
  return typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= 214
    && /^(?:@[-a-z0-9][-a-z0-9._]*\/[-a-z0-9][-a-z0-9._]*|[-a-z0-9][-a-z0-9._]*)$/.test(value);
}

function distributionValid(item) {
  const keys = ['id', 'kind', 'package', 'version', 'integrity', 'registry_url'];
  if (item?.targets !== undefined) keys.push('targets');
  return exactKeys(item, keys) && boundedText(item.id, 128) && item.kind === 'npm_package'
    && npmPackage(item.package) && version(item.version) && sha256.test(item.integrity)
    && httpsUrl(item.registry_url) && (item.targets === undefined || (Array.isArray(item.targets)
      && item.targets.length <= 32 && item.targets.every((target) => boundedText(target, 128))
      && new Set(item.targets).size === item.targets.length));
}

function documentValid(item) {
  const keys = ['id', 'revision', 'language', 'topic', 'url', 'digest', 'size', 'media_type'];
  if (item?.target !== undefined) keys.push('target');
  return exactKeys(item, keys) && boundedText(item.id, 128) && boundedText(item.revision, 128)
    && boundedText(item.language, 32) && boundedText(item.topic, 128)
    && (item.target === undefined || item.target === null || boundedText(item.target, 128)) && httpsUrl(item.url)
    && sha256.test(item.digest) && Number.isSafeInteger(item.size)
    && item.size > 0 && item.size <= 1024 * 1024 && item.media_type === 'text/markdown';
}

function releaseValid(item) {
  const keys = ['plugin_id', 'version', 'publisher_id', 'title', 'summary', 'source_url',
    'source_revision', 'license', 'distributions', 'availability'];
  if (item?.documentation !== undefined) keys.push('documentation');
  return exactKeys(item, keys) && pluginId(item.plugin_id) && version(item.version)
    && boundedText(item.publisher_id, 128) && boundedText(item.title, 160)
    && boundedText(item.summary, 640) && boundedText(item.license, 128)
    && httpsUrl(item.source_url) && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(item.source_revision)
    && ['listed', 'yanked', 'revoked'].includes(item.availability)
    && Array.isArray(item.distributions) && item.distributions.length >= 1
    && item.distributions.length <= 16 && item.distributions.every(distributionValid)
    && new Set(item.distributions.map((distribution) => distribution.id)).size === item.distributions.length
    && (item.documentation === undefined || Array.isArray(item.documentation))
    && (item.documentation ?? []).length <= 64 && (item.documentation ?? []).every(documentValid)
    && new Set((item.documentation ?? []).map((document) => `${document.id}\0${document.revision}`)).size === (item.documentation ?? []).length;
}

function base64(value) {
  if (typeof value !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('invalid package catalog base64');
  }
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new Error('noncanonical package catalog base64');
  return bytes;
}

export function verifyPackageCatalog(raw, trust, now = Math.floor(Date.now() / 1000), previous = null) {
  if (!Buffer.isBuffer(raw) || raw.length > maxEnvelopeBytes) throw new Error('package catalog envelope exceeds limit');
  const envelope = JSON.parse(raw.toString('utf8'));
  if (!exactKeys(envelope, ['key_id', 'payload_base64', 'signature_base64'])) throw new Error('invalid package catalog envelope');
  if (!boundedText(envelope.key_id, 128) || envelope.key_id !== trust.keyId
    || !boundedText(trust.catalogId, 128) || !/^[0-9a-f]{64}$/.test(trust.publicKeyHex)) {
    throw new Error('package catalog trust mismatch');
  }
  const payload = base64(envelope.payload_base64);
  const signature = base64(envelope.signature_base64);
  if (signature.length !== 64) throw new Error('invalid package catalog signature');
  const publicKey = createPublicKey({ key: Buffer.concat([spkiPrefix, Buffer.from(trust.publicKeyHex, 'hex')]), format: 'der', type: 'spki' });
  const signed = Buffer.concat([context, Buffer.from(envelope.key_id), Buffer.from([0]), payload]);
  if (!verify(null, signed, publicKey, signature)) throw new Error('package catalog signature verification failed');
  const snapshot = JSON.parse(payload.toString('utf8'));
  if (!exactKeys(snapshot, ['schema', 'catalog_id', 'revision', 'issued_at', 'expires_at', 'releases'])
    || snapshot.schema !== schema || snapshot.catalog_id !== trust.catalogId
    || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1
    || !Number.isSafeInteger(snapshot.issued_at) || snapshot.issued_at < 0
    || !Number.isSafeInteger(snapshot.expires_at) || snapshot.expires_at < 0
    || snapshot.issued_at > now || snapshot.expires_at <= now
    || snapshot.expires_at - snapshot.issued_at > 604800
    || !Array.isArray(snapshot.releases) || snapshot.releases.length > 4096) {
    throw new Error('package catalog payload is not current or valid');
  }
  const identities = new Set();
  for (const release of snapshot.releases) {
    if (!releaseValid(release)) throw new Error('invalid package catalog release');
    const identity = `${release.plugin_id}@${release.version}`;
    if (identities.has(identity)) throw new Error('duplicate package catalog release');
    identities.add(identity);
  }
  const checkpoint = packageCheckpoint(snapshot, payload, previous);
  return {
    catalogId: snapshot.catalog_id, revision: snapshot.revision, expiresAt: snapshot.expires_at,
    checkpoint,
    baseReleases: snapshot.releases.map((release) => ({ pluginId: release.plugin_id,
      version: release.version, source: release })),
    releases: snapshot.releases.filter((release) => release.availability === 'listed').map((release) => ({
      pluginId: release.plugin_id, version: release.version, title: release.title,
      summary: release.summary, publisherId: release.publisher_id, sourceUrl: release.source_url,
      sourceRevision: release.source_revision, license: release.license,
      distributions: release.distributions.map((item) => ({ id: item.id, kind: item.kind,
        package: item.package, version: item.version, integrity: item.integrity,
        registryUrl: item.registry_url, targets: item.targets ?? [] })),
      documentation: (release.documentation ?? []).map((document) => {
        const { target, ...metadata } = document;
        return { ...metadata, ...(target == null ? {} : { target }),
          slug: documentSlug(release.plugin_id, release.version, document, 'package') };
      }),
    })),
  };
}

export function assertIndependentPackageIdentities(packageBase, linkedBase, portableBase, checkpoints = {}, linkedJoins = new Set()) {
  const identities = (base, checkpoint) => new Set([
    ...(base?.baseReleases ?? []).map((release) => `${release.pluginId}@${release.version}`),
    ...Object.keys(checkpoint?.release_identities ?? {}),
  ]);
  const packages = identities(packageBase, checkpoints.package);
  const linked = identities(linkedBase, checkpoints.linked_cargo);
  const portable = identities(portableBase, checkpoints.portable);
  const currentPackage = identities(packageBase, null);
  const currentLinked = identities(linkedBase, null);
  for (const identity of packages) {
    if (portable.has(identity) || (linked.has(identity)
      && !(linkedJoins.has(identity) && currentPackage.has(identity) && currentLinked.has(identity)))) {
      throw new Error(`package identity conflicts with Portable or unjoined linked Cargo history: ${identity}`);
    }
  }
}
