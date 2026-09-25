import { createHash } from 'node:crypto';

// Build-time mirrors of the independent Marketplace checkpoint types.
// The outer bundle is Site-local transport, not a signed catalog protocol.
export const checkpointSchema = 'lenso.site.catalog-checkpoints.v1';
const hash = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const hashJson = (value) => hash(Buffer.from(JSON.stringify(value)));
const digest = /^sha256:[0-9a-f]{64}$/;
const validText = (value, max) => typeof value === 'string' && value.trim().length > 0
  && Buffer.byteLength(value, 'utf8') <= max && !/[\p{Cc}]/u.test(value);
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => object(value)
  && Object.keys(value).sort().join(',') === [...keys].sort().join(',');

function validateHistory(map, limit, maxBytes = Infinity, maxIdentityBytes = 640) {
  if (!object(map) || Object.keys(map).length > limit) throw new Error('catalog checkpoint history exceeds entry limit');
  let bytes = 0;
  for (const [identity, identityDigest] of Object.entries(map)) {
    if (!identity || Buffer.byteLength(identity, 'utf8') > maxIdentityBytes || !digest.test(identityDigest)) {
      throw new Error('invalid catalog checkpoint history identity or digest');
    }
    bytes += Buffer.byteLength(identity, 'utf8') + Buffer.byteLength(identityDigest, 'utf8');
    if (bytes > maxBytes) throw new Error('catalog checkpoint history exceeds byte limit');
  }
}

export function validateCheckpoint(checkpoint, channel, catalogId) {
  if (checkpoint === null || checkpoint === undefined) return null;
  const documents = channel !== 'portable' && channel !== 'content';
  const keys = ['catalog_id', 'revision', 'payload_digest', 'release_identities'];
  if (documents) keys.push('document_identities');
  if (!exactKeys(checkpoint, keys) || checkpoint.catalog_id !== catalogId
    || !validText(checkpoint.catalog_id, 128)
    || !Number.isSafeInteger(checkpoint.revision) || checkpoint.revision < 1
    || !digest.test(checkpoint.payload_digest)) {
    throw new Error(`invalid ${channel} catalog checkpoint`);
  }
  const maxReleases = channel === 'portable' ? 65_536 : 16_384;
  const maxDocuments = channel === 'portable' ? 0 : 65_536;
  const maxIdentityBytes = channel === 'package' ? 1024 : 640;
  validateHistory(checkpoint.release_identities, maxReleases,
    channel === 'portable' ? Infinity : 8 * 1024 * 1024, maxIdentityBytes);
  if (channel === 'content' && Object.keys(checkpoint.release_identities)
    .some((identity) => Buffer.byteLength(identity, 'utf8') > 512)) {
    throw new Error('release content checkpoint identity exceeds limit');
  }
  if (documents) {
    validateHistory(checkpoint.document_identities, maxDocuments, Infinity, maxIdentityBytes);
    const totalBytes = [...Object.entries(checkpoint.release_identities), ...Object.entries(checkpoint.document_identities)]
      .reduce((sum, [identity, value]) => sum + Buffer.byteLength(identity) + Buffer.byteLength(value), 0);
    if (totalBytes > 8 * 1024 * 1024) throw new Error(`${channel} catalog checkpoint history exceeds byte limit`);
  }
  return checkpoint;
}

function canonicalArtifact(artifact) {
  return { url: artifact.url, digest: artifact.digest, size: artifact.size,
    manifest_digest: artifact.manifest_digest };
}
function canonicalDocument(document) {
  return {
    id: document.id, revision: document.revision, language: document.language,
    topic: document.topic,
    ...(document.target === undefined ? {} : { target: document.target }),
    url: document.url, digest: document.digest, size: document.size,
    media_type: document.media_type,
  };
}
function canonicalDistribution(distribution) {
  return {
    id: distribution.id, kind: distribution.kind, package: distribution.package,
    version: distribution.version,
    ...(distribution.integrity === undefined ? {} : { integrity: distribution.integrity }),
    ...(distribution.registry_url === undefined ? {} : { registry_url: distribution.registry_url }),
    ...(distribution.artifact === undefined ? {} : { artifact: canonicalArtifact(distribution.artifact) }),
    ...(distribution.targets?.length ? { targets: distribution.targets } : {}),
  };
}

function begin(snapshot, payload, previous, channel) {
  validateCheckpoint(previous, channel, snapshot.catalog_id);
  const releaseIdentities = { ...(previous?.release_identities ?? {}) };
  const documentIdentities = channel === 'portable' || channel === 'content'
    ? null : { ...(previous?.document_identities ?? {}) };
  return { releaseIdentities, documentIdentities,
    checkpoint: { catalog_id: snapshot.catalog_id, revision: snapshot.revision,
      payload_digest: hash(payload) } };
}
function retain(map, identity, immutable, message) {
  if (Object.hasOwn(map, identity) && map[identity] !== immutable) {
    throw new Error(`${message}: ${identity}`);
  }
  map[identity] = immutable;
}
function finish(snapshot, previous, channel, state) {
  const checkpoint = {
    ...state.checkpoint,
    release_identities: state.releaseIdentities,
    ...(state.documentIdentities === null ? {} : { document_identities: state.documentIdentities }),
  };
  validateCheckpoint(checkpoint, channel, snapshot.catalog_id);
  if (previous && checkpoint.revision < previous.revision) {
    throw new Error(`${channel} catalog rollback rejected`);
  }
  if (previous && checkpoint.revision === previous.revision
    && checkpoint.payload_digest !== previous.payload_digest) {
    throw new Error(`${channel} catalog revision equivocation rejected`);
  }
  return checkpoint;
}

export function portableCheckpoint(snapshot, payload, previous = null) {
  const state = begin(snapshot, payload, previous, 'portable');
  for (const release of snapshot.releases) {
    const identity = `${release.plugin_id}@${release.version}`;
    const immutable = hashJson([
      release.publisher_id, release.source_url, release.source_revision,
      release.artifact.digest, release.artifact.size, release.artifact.manifest_digest,
    ]);
    retain(state.releaseIdentities, identity, immutable, 'published release identity changed');
  }
  return finish(snapshot, previous, 'portable', state);
}

export function linkedCheckpoint(snapshot, payload, previous = null) {
  const state = begin(snapshot, payload, previous, 'linked');
  for (const release of snapshot.releases) {
    const identity = `${release.plugin_id}@${release.version}`;
    const immutable = hashJson([
      release.plugin_id, release.version, release.publisher_id, release.title,
      release.summary, release.source_url, release.source_revision, release.license,
      release.package, release.registry_url, release.crate_digest,
      release.integration, release.targets,
    ]);
    retain(state.releaseIdentities, identity, immutable, 'published linked Cargo release changed');
    for (const document of release.documentation ?? []) {
      const documentIdentity = `${identity}/${document.id}@${document.revision}`;
      retain(state.documentIdentities, documentIdentity, hashJson(canonicalDocument(document)),
        'published linked Cargo documentation changed');
    }
  }
  return finish(snapshot, previous, 'linked', state);
}

export function packageCheckpoint(snapshot, payload, previous = null) {
  const state = begin(snapshot, payload, previous, 'package');
  for (const release of snapshot.releases) {
    const identity = `${release.plugin_id}@${release.version}`;
    const immutable = hashJson([
      release.plugin_id, release.version, release.publisher_id, release.title,
      release.summary, release.source_url, release.source_revision, release.license,
      release.distributions.map(canonicalDistribution),
    ]);
    retain(state.releaseIdentities, identity, immutable, 'published package release changed');
    for (const document of release.documentation ?? []) {
      const documentIdentity = JSON.stringify([release.plugin_id, release.version, document.id, document.revision]);
      retain(state.documentIdentities, documentIdentity,
        hashJson(canonicalDocument(document.target === null ? { ...document, target: undefined } : document)),
        'published package documentation changed');
    }
  }
  return finish(snapshot, previous, 'package', state);
}

export function detailsCheckpoint(snapshot, payload, previous = null) {
  const state = begin(snapshot, payload, previous, 'details');
  for (const release of snapshot.releases) {
    const identity = `${release.plugin_id}@${release.version}`;
    const immutable = hashJson([
      release.plugin_id, release.version, release.base_release_identity,
      release.distributions.map(canonicalDistribution),
    ]);
    retain(state.releaseIdentities, identity, immutable, 'published release details changed');
    for (const document of release.documentation ?? []) {
      const documentIdentity = `${identity}/${document.id}@${document.revision}`;
      retain(state.documentIdentities, documentIdentity, hashJson(canonicalDocument(document)),
        'published documentation changed');
    }
  }
  return finish(snapshot, previous, 'details', state);
}

export function releaseContentCheckpoint(snapshot, payload, previous = null) {
  const state = begin(snapshot, payload, previous, 'content');
  for (const release of snapshot.releases) {
    const identity = `${release.plugin_id}@${release.version}`;
    const immutable = hashJson([
      release.plugin_id, release.version, release.base_kind, release.base_release_identity,
      release.content.map((item) => [item.id, item.kind, item.url, item.digest, item.size]),
    ]);
    retain(state.releaseIdentities, identity, immutable, 'published release content changed');
  }
  return finish(snapshot, previous, 'content', state);
}

export function validateCheckpointBundle(bundle, catalogId) {
  if (!exactKeys(bundle, ['schema', 'catalog_id', 'portable', 'release_details', 'linked_cargo'])
    && !exactKeys(bundle, ['schema', 'catalog_id', 'portable', 'release_details', 'linked_cargo', 'release_content'])
    && !exactKeys(bundle, ['schema', 'catalog_id', 'portable', 'release_details', 'linked_cargo', 'package'])
    && !exactKeys(bundle, ['schema', 'catalog_id', 'portable', 'release_details', 'linked_cargo', 'release_content', 'package'])) {
    throw new Error('invalid Site catalog checkpoint bundle');
  }
  if (bundle.schema !== checkpointSchema || bundle.catalog_id !== catalogId
    || !validText(bundle.catalog_id, 128)) {
    throw new Error('invalid Site catalog checkpoint bundle');
  }
  validateCheckpoint(bundle.portable, 'portable', catalogId);
  validateCheckpoint(bundle.release_details, 'details', catalogId);
  validateCheckpoint(bundle.linked_cargo, 'linked', catalogId);
  if (Object.hasOwn(bundle, 'release_content')) validateCheckpoint(bundle.release_content, 'content', catalogId);
  if (Object.hasOwn(bundle, 'package')) validateCheckpoint(bundle.package, 'package', catalogId);
  return bundle;
}

export function emptyCheckpointBundle(catalogId) {
  return { schema: checkpointSchema, catalog_id: catalogId,
    portable: null, release_details: null, linked_cargo: null };
}
