import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { verifyPackageCatalog } from './package-catalog.mjs';

const schema = 'lenso.marketplace.package-snapshot.v1';
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalogId: 'test', keyId: 'test-key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const distribution = {
  id: 'npm', kind: 'npm_package', package: '@example/notes', version: '4.5.6',
  integrity: `sha256:${'a'.repeat(64)}`, registry_url: 'https://registry.npmjs.org',
};
const release = {
  plugin_id: 'example.notes', version: '1.2.3', publisher_id: 'example',
  title: 'Notes', summary: 'Notes package', source_url: 'https://example.test/source',
  source_revision: 'b'.repeat(40), license: 'MIT',
  distributions: [distribution], availability: 'listed',
};

function signed(overrides = {}) {
  const payload = Buffer.from(JSON.stringify({
    schema, catalog_id: trust.catalogId, revision: 1,
    issued_at: 100, expires_at: 200, releases: [release], ...overrides,
  }));
  return Buffer.from(JSON.stringify({
    key_id: trust.keyId, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, Buffer.concat([
      Buffer.from(`${schema}\0${trust.keyId}\0`), payload,
    ]), privateKey).toString('base64'),
  }));
}

test('verifies an exact listed npm-only release without a Portable base', () => {
  const verified = verifyPackageCatalog(signed(), trust, 150);
  assert.equal(verified.releases[0].pluginId, 'example.notes');
  assert.equal(verified.releases[0].distributions[0].kind, 'npm_package');
  assert.equal(verified.releases[0].distributions[0].integrity, distribution.integrity);
  assert.equal(verified.baseReleases[0].identity,
    verified.checkpoint.release_identities['example.notes@1.2.3']);
  assert.equal(verifyPackageCatalog(signed({ revision: 2, releases: [{
    ...release, availability: 'revoked',
  }] }), trust, 150, verified.checkpoint).releases.length, 0);
});

test('rejects tampering, unrelated kinds, invalid registries and duplicate identities', () => {
  const tampered = JSON.parse(signed().toString());
  tampered.payload_base64 = Buffer.from('{}').toString('base64');
  assert.throws(() => verifyPackageCatalog(Buffer.from(JSON.stringify(tampered)), trust, 150));
  assert.throws(() => verifyPackageCatalog(signed(), { ...trust, catalogId: 'other' }, 150));
  assert.throws(() => verifyPackageCatalog(signed(), trust, 200));
  assert.throws(() => verifyPackageCatalog(signed({ releases: [release, release] }), trust, 150));
  for (const invalid of [
    { ...distribution, kind: 'portable_bundle' },
    { ...distribution, registry_url: 'http://registry.npmjs.org' },
    { ...distribution, package: '@example/../notes' },
    { ...distribution, integrity: null },
  ]) assert.throws(() => verifyPackageCatalog(signed({
    releases: [{ ...release, distributions: [invalid] }],
  }), trust, 150));
});

test('package checkpoint rejects rollback, equivocation and rewritten npm integrity', () => {
  const first = verifyPackageCatalog(signed(), trust, 150);
  assert.throws(() => verifyPackageCatalog(signed({ releases: [release, release] }), trust, 150));
  assert.throws(() => verifyPackageCatalog(signed({ releases: [] }), trust, 150, first.checkpoint),
    /equivocation/);
  const second = verifyPackageCatalog(signed({ revision: 2, releases: [] }), trust, 150, first.checkpoint);
  assert.throws(() => verifyPackageCatalog(signed(), trust, 150, second.checkpoint), /rollback/);
  assert.throws(() => verifyPackageCatalog(signed({ revision: 3, releases: [{
    ...release, distributions: [{ ...distribution, integrity: `sha256:${'c'.repeat(64)}` }],
  }] }), trust, 150, second.checkpoint), /published package release changed/);
});
