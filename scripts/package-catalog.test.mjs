import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { assertIndependentPackageIdentities, verifyPackageCatalog } from './package-catalog.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalogId: 'test', keyId: 'test-key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const distribution = {
  id: 'bun', kind: 'npm_package', package: '@example/bun-plugin', version: '2.1.0',
  integrity: `sha256:${'b'.repeat(64)}`, registry_url: 'https://registry.npmjs.org', targets: ['workers'],
};
const document = { id: 'quickstart', revision: 'v1', language: 'en', topic: 'Getting started',
  url: 'https://example.test/quickstart.md', digest: `sha256:${'c'.repeat(64)}`,
  size: 123, media_type: 'text/markdown' };
const release = {
  plugin_id: 'example.bun', version: '1.0.0', publisher_id: 'example', title: 'Bun Plugin',
  summary: 'Example package-only Plugin', source_url: 'https://example.test/bun',
  source_revision: 'a'.repeat(40), license: 'MIT', distributions: [distribution],
  availability: 'listed', documentation: [document],
};
const snapshot = {
  schema: 'lenso.marketplace.package-snapshot.v1', catalog_id: 'test', revision: 2,
  issued_at: 100, expires_at: 200,
  releases: [release, { ...release, version: '0.9.0', availability: 'yanked' }],
};
function envelope(value) {
  const payload = Buffer.from(JSON.stringify(value));
  const signed = Buffer.concat([Buffer.from('lenso.marketplace.package-snapshot.v1\0test-key\0'), payload]);
  return Buffer.from(JSON.stringify({ key_id: 'test-key', payload_base64: payload.toString('base64'),
    signature_base64: sign(null, signed, privateKey).toString('base64') }));
}

test('signed npm-only listing retains independent Plugin and package versions', () => {
  const verified = verifyPackageCatalog(envelope(snapshot), trust, 150);
  assert.deepEqual(verified.releases.map((item) => item.version), ['1.0.0']);
  assert.equal(verified.releases[0].distributions[0].version, '2.1.0');
  assert.equal(verified.releases[0].documentation[0].slug.startsWith('package-'), true);
  assert.ok(verified.checkpoint.release_identities['example.bun@0.9.0']);
  assert.ok(verified.checkpoint.document_identities[JSON.stringify(['example.bun', '1.0.0', 'quickstart', 'v1'])]);
});

test('rejects untrusted, expired, tampered or invalid package-only data', () => {
  assert.throws(() => verifyPackageCatalog(envelope(snapshot), { ...trust, keyId: 'other' }, 150));
  assert.throws(() => verifyPackageCatalog(envelope(snapshot), trust, 200));
  const changed = JSON.parse(envelope(snapshot).toString());
  changed.payload_base64 = Buffer.from(JSON.stringify({ ...snapshot, revision: 3 })).toString('base64');
  assert.throws(() => verifyPackageCatalog(Buffer.from(JSON.stringify(changed)), trust, 150));
  for (const invalid of [
    { ...release, distributions: [{ ...distribution, integrity: 'bad' }] },
    { ...release, distributions: [{ ...distribution, registry_url: 'http://registry.npmjs.org' }] },
    { ...release, distributions: [{ ...distribution, kind: 'portable_bundle' }] },
    { ...release, distributions: [{ ...distribution, artifact: {} }] },
    { ...release, distributions: [{ ...distribution, package: '@Bad/Name' }] },
    { ...release, distributions: [{ ...distribution, version: '18446744073709551616.0.0' }] },
    { ...release, version: '18446744073709551616.0.0' },
    { ...release, version: '1.0.0-01' },
    { ...release, documentation: [{ ...document, size: 0 }] },
    { ...release, documentation: [document, document] },
    { ...release, plugin_id: '../escape' },
  ]) {
    assert.throws(() => verifyPackageCatalog(envelope({ ...snapshot, releases: [invalid] }), trust, 150));
  }
});

test('matches Rust npm-name and semver boundaries', () => {
  for (const packageName of ['-plugin', '@-team/-plugin']) {
    const verified = verifyPackageCatalog(envelope({ ...snapshot, releases: [{ ...release,
      version: '18446744073709551615.0.0-0+build.01',
      distributions: [{ ...distribution, package: packageName }] }] }), trust, 150);
    assert.equal(verified.releases[0].distributions[0].package, packageName);
  }
  for (const packageName of ['.plugin', '_plugin', '@.team/plugin', '@team/_plugin']) {
    assert.throws(() => verifyPackageCatalog(envelope({ ...snapshot, releases: [{ ...release,
      distributions: [{ ...distribution, package: packageName }] }] }), trust, 150));
  }
});

test('package history rejects rollback, equivocation, immutable rewrite and retains omissions', () => {
  const first = verifyPackageCatalog(envelope(snapshot), trust, 150);
  const empty = verifyPackageCatalog(envelope({ ...snapshot, revision: 3, releases: [] }), trust, 150, first.checkpoint);
  assert.deepEqual(empty.checkpoint.release_identities, first.checkpoint.release_identities);
  assert.throws(() => verifyPackageCatalog(envelope({ ...snapshot, revision: 1 }), trust, 150, empty.checkpoint), /rollback/);
  assert.throws(() => verifyPackageCatalog(envelope({ ...snapshot, releases: [] }), trust, 150, first.checkpoint), /equivocation/);
  assert.throws(() => verifyPackageCatalog(envelope({ ...snapshot, revision: 4,
    releases: [{ ...release, distributions: [{ ...distribution, integrity: `sha256:${'d'.repeat(64)}` }] }] }),
  trust, 150, empty.checkpoint), /release changed/);
});

test('package documentation history keeps separator-bearing IDs distinct', () => {
  const first = { ...document, id: 'a@b', revision: 'c' };
  const second = { ...document, id: 'a', revision: 'b@c' };
  const verified = verifyPackageCatalog(envelope({ ...snapshot, releases: [{ ...release,
    documentation: [first, second] }] }), trust, 150);
  const keys = Object.keys(verified.checkpoint.document_identities);
  assert.equal(keys.length, 2);
  assert.ok(keys.includes(JSON.stringify(['example.bun', '1.0.0', 'a@b', 'c'])));
  assert.ok(keys.includes(JSON.stringify(['example.bun', '1.0.0', 'a', 'b@c'])));
});

test('explicit nullable document target matches Rust optional-field identity', () => {
  const first = verifyPackageCatalog(envelope({ ...snapshot, releases: [release] }), trust, 150);
  const withNull = verifyPackageCatalog(envelope({ ...snapshot, revision: 3, releases: [{ ...release,
    documentation: [{ ...document, target: null }] }] }), trust, 150, first.checkpoint);
  const identity = JSON.stringify(['example.bun', '1.0.0', 'quickstart', 'v1']);
  assert.equal(withNull.checkpoint.document_identities[identity], first.checkpoint.document_identities[identity]);
  assert.ok(!Object.hasOwn(withNull.releases[0].documentation[0], 'target'));
});

test('npm-only identity cannot collide with current or checkpointed other channels', () => {
  const current = { baseReleases: [{ pluginId: 'example.bun', version: '1.0.0' }] };
  assert.throws(() => assertIndependentPackageIdentities(current, current, null), /conflicts/);
  assert.throws(() => assertIndependentPackageIdentities(current, null, current), /conflicts/);
  assert.throws(() => assertIndependentPackageIdentities(null, null, current, {
    package: { release_identities: { 'example.bun@1.0.0': `sha256:${'a'.repeat(64)}` } },
  }), /conflicts/);
  assert.doesNotThrow(() => assertIndependentPackageIdentities(current, {
    baseReleases: [{ pluginId: 'example.bun', version: '2.0.0' }],
  }, null));
});
