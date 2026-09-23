import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { verifyLinkedCatalog } from './linked-catalog.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalogId: 'test', keyId: 'test-key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const release = {
  plugin_id: 'example.web', version: '1.0.0', publisher_id: 'example', title: 'Web',
  summary: 'Web ingress', source_url: 'https://example.test/web', source_revision: 'a'.repeat(40),
  license: 'MIT', package: 'example-web', registry_url: 'https://crates.io',
  crate_digest: `sha256:${'b'.repeat(64)}`, integration: 'linked_plugin', targets: ['aarch64-apple-darwin'],
  availability: 'listed', documentation: [{ id: 'quickstart', revision: 'v1', language: 'en', topic: 'Getting started',
    url: 'https://example.test/quickstart.md', digest: `sha256:${'c'.repeat(64)}`, size: 123, media_type: 'text/markdown' }],
};
function envelope(snapshot) {
  const payload = Buffer.from(JSON.stringify(snapshot));
  const message = Buffer.concat([Buffer.from('lenso.marketplace.linked-cargo-snapshot.v1\0test-key\0'), payload]);
  return Buffer.from(JSON.stringify({
    key_id: 'test-key', payload_base64: payload.toString('base64'),
    signature_base64: sign(null, message, privateKey).toString('base64'),
  }));
}
const snapshot = {
  schema: 'lenso.marketplace.linked-cargo-snapshot.v1', catalog_id: 'test',
  revision: 2, issued_at: 100, expires_at: 200,
  releases: [release, { ...release, version: '0.9.0', availability: 'yanked' }],
};

test('accepts exact signed current linked releases and excludes yanked versions', () => {
  assert.deepEqual(verifyLinkedCatalog(envelope(snapshot), trust, 150).releases.map((item) => item.version), ['1.0.0']);
  assert.deepEqual(verifyLinkedCatalog(envelope(snapshot), trust, 150).releases[0].documentation, release.documentation);
});

test('rejects malformed signed release and document metadata', () => {
  for (const invalid of [
    { ...release, crate_digest: 'b'.repeat(64) },
    { ...release, documentation: [{ ...release.documentation[0], size: 0 }] },
    { ...release, documentation: null },
    { ...release, documentation: [{ ...release.documentation[0], url: 'http://example.test/doc' }] },
    { ...release, documentation: [...release.documentation, release.documentation[0]] },
    { ...release, targets: ['aarch64-apple-darwin', 'aarch64-apple-darwin'] },
  ]) {
    assert.throws(() => verifyLinkedCatalog(envelope({ ...snapshot, releases: [invalid] }), trust, 150));
  }
});

test('rejects untrusted, modified, expired, and duplicate catalogs', () => {
  const signed = envelope(snapshot);
  assert.throws(() => verifyLinkedCatalog(signed, { ...trust, keyId: 'other' }, 150));
  assert.throws(() => verifyLinkedCatalog(signed, trust, 200));
  const changed = JSON.parse(signed.toString());
  changed.payload_base64 = Buffer.from(JSON.stringify({ ...snapshot, revision: 3 })).toString('base64');
  assert.throws(() => verifyLinkedCatalog(Buffer.from(JSON.stringify(changed)), trust, 150));
  assert.throws(() => verifyLinkedCatalog(envelope({ ...snapshot, releases: [release, release] }), trust, 150));
});
