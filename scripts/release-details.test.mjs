import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { verifyReleaseDetails, joinPortableReleaseDetails } from './release-details.mjs';
import { verifyPortableCatalog } from './portable-catalog.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalogId: 'test', keyId: 'test-key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const artifact = {
  url: 'https://example.test/echo.bundle', digest: `sha256:${'b'.repeat(64)}`,
  size: 123, manifest_digest: `sha256:${'c'.repeat(64)}`,
};
const release = {
  plugin_id: 'example.echo', version: '1.2.3', publisher_id: 'example', title: 'Echo',
  summary: 'Portable echo Plugin', source_url: 'https://example.test/echo',
  source_revision: 'a'.repeat(40), license: 'MIT', artifact, availability: 'listed',
};
const baseIdentity = `sha256:${createHash('sha256').update(JSON.stringify([
  release.publisher_id, release.source_url, release.source_revision,
  artifact.digest, artifact.size, artifact.manifest_digest,
])).digest('hex')}`;
const document = {
  id: 'quickstart', revision: 'rev-1', language: 'en', topic: 'Getting started',
  url: 'https://docs.example.test/quickstart.md', digest: `sha256:${'d'.repeat(64)}`,
  size: 50, media_type: 'text/markdown',
};
const details = {
  plugin_id: release.plugin_id, version: release.version, base_release_identity: baseIdentity,
  distributions: [{
    id: 'portable', kind: 'portable_bundle', package: release.plugin_id,
    version: release.version, artifact,
  }],
  documentation: [document],
};

function signed(schema, payload) {
  const bytes = Buffer.from(JSON.stringify(payload));
  const message = Buffer.concat([Buffer.from(`${schema}\0${trust.keyId}\0`), bytes]);
  return Buffer.from(JSON.stringify({
    key_id: trust.keyId, payload_base64: bytes.toString('base64'),
    signature_base64: sign(null, message, privateKey).toString('base64'),
  }));
}
function base(overrides = {}) {
  return signed('lenso.marketplace.snapshot.v1', {
    schema: 'lenso.marketplace.snapshot.v1', catalog_id: trust.catalogId,
    revision: 2, issued_at: 100, expires_at: 200, releases: [release], ...overrides,
  });
}
function detailSnapshot(overrides = {}) {
  return signed('lenso.marketplace.release-details.v1', {
    schema: 'lenso.marketplace.release-details.v1', catalog_id: trust.catalogId,
    revision: 3, issued_at: 101, expires_at: 199, releases: [details], ...overrides,
  });
}

test('accepts signed details only for the exact immutable Portable release', () => {
  const portable = verifyPortableCatalog(base(), trust, 150);
  const verified = verifyReleaseDetails(detailSnapshot(), trust, 150);
  const joined = joinPortableReleaseDetails(portable, verified);
  assert.equal(joined.releases[0].documentation[0].topic, 'Getting started');
  assert.equal(joined.detailsRevision, 3);
  assert.equal(joined.detailsExpiresAt, 199);
});

test('verifies the real Rust signer v1 fixture across the JS/Rust serialization boundary', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/rust-release-details.json', import.meta.url), 'utf8'));
  const rustTrust = { catalogId: 'catalog', keyId: 'key', publicKeyHex: fixture.public_key_hex };
  const portable = verifyPortableCatalog(Buffer.from(JSON.stringify(fixture.base_envelope)), rustTrust, 150);
  const verified = verifyReleaseDetails(Buffer.from(JSON.stringify(fixture.details_envelope)), rustTrust, 150);
  const joined = joinPortableReleaseDetails(portable, verified);
  assert.equal(joined.releases[0].pluginId, 'example.notes');
  assert.equal(joined.releases[0].documentation[0].topic, 'Quickstart');
  assert.equal(joined.releases[0].documentation[0].digest, `sha256:${createHash('sha256').update('docs').digest('hex')}`);
});

test('rejects unsigned, changed, expired, future, and invalid signed details', () => {
  const signedDetails = detailSnapshot();
  const changed = JSON.parse(signedDetails.toString());
  changed.payload_base64 = Buffer.from(JSON.stringify({ changed: true })).toString('base64');
  for (const bytes of [Buffer.from('{}'), Buffer.from(JSON.stringify(changed))]) {
    assert.throws(() => verifyReleaseDetails(bytes, trust, 150));
  }
  assert.throws(() => verifyReleaseDetails(signedDetails, trust, 199));
  assert.throws(() => verifyReleaseDetails(signedDetails, trust, 100));
  assert.throws(() => verifyReleaseDetails(detailSnapshot({ releases: [details, details] }), trust, 150));
  for (const invalid of [
    { ...details, documentation: [{ ...document, url: 'http://docs.example.test/quickstart.md' }] },
    { ...details, documentation: [{ ...document, size: 1024 * 1024 + 1 }] },
    { ...details, documentation: [{ ...document, media_type: 'text/html' }] },
    { ...details, documentation: [document, document] },
  ]) {
    const snapshot = detailSnapshot({ releases: [invalid] });
    assert.throws(() => verifyReleaseDetails(snapshot, trust, 150));
  }
});

test('rejects stale or mismatched details even when both signatures are valid', () => {
  const portable = verifyPortableCatalog(base(), trust, 150);
  for (const invalid of [
    { ...details, base_release_identity: `sha256:${'0'.repeat(64)}` },
    { ...details, distributions: [{ ...details.distributions[0], artifact: { ...artifact, size: 124 } }] },
    { ...details, distributions: [{ ...details.distributions[0], artifact: { ...artifact, digest: `sha256:${'e'.repeat(64)}` } }] },
  ]) {
    const verified = verifyReleaseDetails(detailSnapshot({ releases: [invalid] }), trust, 150);
    assert.throws(() => joinPortableReleaseDetails(portable, verified));
  }
});

test('ignores signed Cargo-only details for another identity without borrowing its documents', () => {
  const cargoOnly = {
    plugin_id: 'example.other', version: '9.0.0', base_release_identity: `sha256:${'f'.repeat(64)}`,
    distributions: [{ id: 'cargo', kind: 'cargo_package', package: 'example-other',
      version: '9.0.0', registry_url: 'https://crates.io', integrity: `sha256:${'e'.repeat(64)}` }],
    documentation: [{ ...document, topic: 'Cargo-only guide' }],
  };
  const portable = verifyPortableCatalog(base(), trust, 150);
  const verified = verifyReleaseDetails(detailSnapshot({ releases: [cargoOnly, details] }), trust, 150);
  const joined = joinPortableReleaseDetails(portable, verified);
  assert.equal(joined.releases.length, 1);
  assert.deepEqual(joined.releases[0].documentation, [document]);
});
