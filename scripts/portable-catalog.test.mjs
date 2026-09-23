import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { verifyPortableCatalog } from './portable-catalog.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalogId: 'test', keyId: 'test-key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const release = {
  plugin_id: 'example.echo', version: '1.2.3', publisher_id: 'example', title: 'Echo',
  summary: 'Portable echo Plugin', source_url: 'https://example.test/echo',
  source_revision: 'a'.repeat(40), license: 'MIT',
  artifact: {
    url: 'https://example.test/echo-1.2.3.bundle', digest: `sha256:${'b'.repeat(64)}`,
    size: 123, manifest_digest: `sha256:${'c'.repeat(64)}`,
  },
  availability: 'listed',
};
const snapshot = {
  schema: 'lenso.marketplace.snapshot.v1', catalog_id: 'test', revision: 2,
  issued_at: 100, expires_at: 200,
  releases: [release, { ...release, version: '1.2.2', availability: 'yanked' }],
};

function envelope(payload) {
  const bytes = Buffer.from(JSON.stringify(payload));
  const message = Buffer.concat([Buffer.from('lenso.marketplace.snapshot.v1\0test-key\0'), bytes]);
  return Buffer.from(JSON.stringify({
    key_id: 'test-key', payload_base64: bytes.toString('base64'),
    signature_base64: sign(null, message, privateKey).toString('base64'),
  }));
}

test('accepts a current signed Portable snapshot and lists only exact available versions', () => {
  const catalog = verifyPortableCatalog(envelope(snapshot), trust, 150);
  assert.equal(catalog.catalogId, 'test');
  assert.equal(catalog.revision, 2);
  assert.deepEqual(catalog.releases.map(({ pluginId, version }) => `${pluginId}@${version}`), ['example.echo@1.2.3']);
  assert.equal(catalog.releases[0].artifactDigest, release.artifact.digest);
  assert.equal(catalog.releases[0].manifestDigest, release.artifact.manifest_digest);
});

test('rejects untrusted, tampered, expired, future, and duplicate Portable snapshots', () => {
  const signed = envelope(snapshot);
  assert.throws(() => verifyPortableCatalog(signed, { ...trust, keyId: 'other' }, 150));
  assert.throws(() => verifyPortableCatalog(signed, trust, 200));
  assert.throws(() => verifyPortableCatalog(signed, trust, 99));
  const changed = JSON.parse(signed.toString());
  changed.payload_base64 = Buffer.from(JSON.stringify({ ...snapshot, revision: 3 })).toString('base64');
  assert.throws(() => verifyPortableCatalog(Buffer.from(JSON.stringify(changed)), trust, 150));
  assert.throws(() => verifyPortableCatalog(envelope({ ...snapshot, releases: [release, release] }), trust, 150));
});

test('rejects signed metadata that is not a valid Portable release', () => {
  for (const invalid of [
    { ...release, plugin_id: '../echo' },
    { ...release, version: 'latest' },
    { ...release, artifact: { ...release.artifact, digest: 'b'.repeat(64) } },
    { ...release, artifact: { ...release.artifact, url: 'http://example.test/bundle' } },
    { ...release, artifact: { ...release.artifact, size: 0 } },
    { ...release, unexpected: true },
  ]) {
    assert.throws(() => verifyPortableCatalog(envelope({ ...snapshot, releases: [invalid] }), trust, 150));
  }
});

test('Portable checkpoint retains hidden history and rejects rollback, equivocation and rewritten reappearance', () => {
  const first = verifyPortableCatalog(envelope(snapshot), trust, 150);
  assert.ok(first.checkpoint.release_identities['example.echo@1.2.2'], 'yanked release remains in history');
  const absent = verifyPortableCatalog(envelope({ ...snapshot, revision: 3, releases: [] }), trust, 150, first.checkpoint);
  assert.deepEqual(absent.checkpoint.release_identities, first.checkpoint.release_identities);
  assert.throws(() => verifyPortableCatalog(envelope({ ...snapshot, revision: 1 }), trust, 150, absent.checkpoint), /rollback/);
  assert.throws(() => verifyPortableCatalog(envelope({ ...snapshot, releases: [] }), trust, 150, first.checkpoint), /equivocation/);
  assert.throws(() => verifyPortableCatalog(envelope({ ...snapshot, revision: 4,
    releases: [{ ...release, artifact: { ...release.artifact, size: 124 } }] }), trust, 150, absent.checkpoint), /identity changed/);
});
