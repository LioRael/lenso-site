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
  const document = verifyLinkedCatalog(envelope(snapshot), trust, 150).releases[0].documentation[0];
  const { slug, ...metadata } = document;
  assert.deepEqual(metadata, release.documentation[0]);
  assert.match(document.slug, /^[0-9a-f]{64}$/);
});

test('rejects malformed signed release and document metadata', () => {
  for (const invalid of [
    { ...release, crate_digest: 'b'.repeat(64) },
    { ...release, documentation: [{ ...release.documentation[0], size: 0 }] },
    { ...release, documentation: null },
    { ...release, documentation: [{ ...release.documentation[0], url: 'http://example.test/doc' }] },
    { ...release, documentation: [...release.documentation, release.documentation[0]] },
    { ...release, targets: ['aarch64-apple-darwin', 'aarch64-apple-darwin'] },
    { ...release, plugin_id: '../escape' },
    { ...release, plugin_id: 'example/escape.web' },
    { ...release, version: '../1.0.0' },
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

test('linked checkpoint retains release and documentation history across omission', () => {
  const first = verifyLinkedCatalog(envelope(snapshot), trust, 150);
  assert.ok(first.checkpoint.release_identities['example.web@0.9.0'], 'yanked release is retained');
  assert.ok(first.checkpoint.document_identities['example.web@1.0.0/quickstart@v1']);
  const absent = verifyLinkedCatalog(envelope({ ...snapshot, revision: 3, releases: [] }), trust, 150, first.checkpoint);
  assert.deepEqual(absent.checkpoint.release_identities, first.checkpoint.release_identities);
  assert.deepEqual(absent.checkpoint.document_identities, first.checkpoint.document_identities);
  assert.throws(() => verifyLinkedCatalog(envelope({ ...snapshot, revision: 1 }), trust, 150, absent.checkpoint), /rollback/);
  assert.throws(() => verifyLinkedCatalog(envelope({ ...snapshot, releases: [] }), trust, 150, first.checkpoint), /equivocation/);
  assert.throws(() => verifyLinkedCatalog(envelope({ ...snapshot, revision: 4,
    releases: [{ ...release, title: 'Rewritten title' }] }), trust, 150, absent.checkpoint), /release changed/);
  assert.throws(() => verifyLinkedCatalog(envelope({ ...snapshot, revision: 4,
    releases: [{ ...release, documentation: [{ ...release.documentation[0], topic: 'Rewritten guide' }] }] }), trust, 150, absent.checkpoint), /documentation changed/);
});

test('accepts an additive signed document revision for an unchanged linked release', () => {
  const first = verifyLinkedCatalog(envelope(snapshot), trust, 150);
  const revision = {
    ...release.documentation[0],
    revision: 'v2',
    topic: 'Updated getting started',
    url: 'https://example.test/quickstart-v2.md',
    digest: `sha256:${'d'.repeat(64)}`,
  };
  const next = verifyLinkedCatalog(envelope({ ...snapshot, revision: 3,
    releases: [{ ...release, documentation: [...release.documentation, revision] }] }),
  trust, 150, first.checkpoint);
  assert.deepEqual(next.releases[0].documentation.map((document) => document.revision), ['v1', 'v2']);
  assert.ok(next.checkpoint.document_identities['example.web@1.0.0/quickstart@v1']);
  assert.ok(next.checkpoint.document_identities['example.web@1.0.0/quickstart@v2']);
});
