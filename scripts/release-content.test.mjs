import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { verifyLinkedCatalog } from './linked-catalog.mjs';
import { verifyPortableCatalog } from './portable-catalog.mjs';
import { joinReleaseContent, verifyReleaseContent } from './release-content.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalogId: 'test', keyId: 'test-key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const baseRelease = {
  plugin_id: 'example.web', version: '1.0.0', publisher_id: 'example', title: 'Web',
  summary: 'Web ingress', source_url: 'https://example.test/web', source_revision: 'a'.repeat(40),
  license: 'MIT', package: 'example-web', registry_url: 'https://crates.io',
  crate_digest: `sha256:${'b'.repeat(64)}`, integration: 'linked_plugin',
  targets: ['aarch64-apple-darwin'], availability: 'listed',
};
const content = [
  { id: 'starter', kind: 'editable_template', url: 'https://example.test/starter.tar.gz',
    digest: `sha256:${'c'.repeat(64)}`, size: 123 },
  { id: 'dev-extension', kind: 'development_extension', url: 'https://example.test/extension.tar.gz',
    digest: `sha256:${'d'.repeat(64)}`, size: 456 },
];

function envelope(schema, snapshot) {
  const payload = Buffer.from(JSON.stringify(snapshot));
  return Buffer.from(JSON.stringify({
    key_id: trust.keyId, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, Buffer.concat([
      Buffer.from(`${schema}\0${trust.keyId}\0`), payload,
    ]), privateKey).toString('base64'),
  }));
}
const linkedSchema = 'lenso.marketplace.linked-cargo-snapshot.v1';
const contentSchema = 'lenso.marketplace.release-content.v2';
function linked(overrides = {}) {
  return verifyLinkedCatalog(envelope(linkedSchema, {
    schema: linkedSchema, catalog_id: trust.catalogId,
    revision: 1, issued_at: 100, expires_at: 200, releases: [baseRelease], ...overrides,
  }), trust, 150);
}
const base = linked();
const release = {
  plugin_id: baseRelease.plugin_id, version: baseRelease.version, base_kind: 'linked_cargo',
  base_release_identity: base.baseReleases[0].identity, content,
};
function signed(overrides = {}) {
  return envelope(contentSchema, {
    schema: contentSchema, catalog_id: trust.catalogId,
    revision: 1, issued_at: 100, expires_at: 200, releases: [release], ...overrides,
  });
}

test('verifies separately signed content and joins only the exact listed base release', () => {
  const verified = verifyReleaseContent(signed(), trust, 150);
  const joined = joinReleaseContent(base, { catalogId: null, releases: [] }, verified);
  assert.equal(joined.releases[0].baseReleaseIdentity, base.baseReleases[0].identity);
  assert.deepEqual(joined.releases[0].content.map((item) => item.kind),
    ['editable_template', 'development_extension']);
  assert.equal(joinReleaseContent(linked({ releases: [{ ...baseRelease, availability: 'yanked' }] }),
    { catalogId: null, releases: [] }, verified).releases.length, 0);
  assert.throws(() => joinReleaseContent(linked({ releases: [{ ...baseRelease, title: 'Changed Web' }] }),
    { catalogId: null, releases: [] }, verified), /immutable linked_cargo base/);
  assert.equal(joinReleaseContent({ catalogId: null, releases: [] },
    { catalogId: null, releases: [] }, verified).releases.length, 0);
});

test('portable content uses its own exact base identity and never borrows linked content', () => {
  const portableSchema = 'lenso.marketplace.snapshot.v1';
  const portableRelease = {
    plugin_id: 'example.portable', version: '2.0.0', publisher_id: 'example', title: 'Portable',
    summary: 'Portable Plugin', source_url: 'https://example.test/portable',
    source_revision: 'a'.repeat(40), license: 'MIT', availability: 'listed',
    artifact: { url: 'https://example.test/portable.lenso-plugin',
      digest: `sha256:${'e'.repeat(64)}`, size: 123, manifest_digest: `sha256:${'f'.repeat(64)}` },
  };
  const portable = verifyPortableCatalog(envelope(portableSchema, {
    schema: portableSchema, catalog_id: trust.catalogId,
    revision: 1, issued_at: 100, expires_at: 200, releases: [portableRelease],
  }), trust, 150);
  const verified = verifyReleaseContent(signed({ releases: [{
    plugin_id: portableRelease.plugin_id, version: portableRelease.version,
    base_kind: 'portable', base_release_identity: portable.baseReleases[0].identity,
    content: [content[0]],
  }] }), trust, 150);
  const joined = joinReleaseContent({ catalogId: null, releases: [] }, portable, verified);
  assert.equal(joined.releases[0].baseKind, 'portable');
  assert.equal(joined.releases[0].content[0].id, 'starter');
  assert.throws(() => joinReleaseContent(base, { ...portable,
    baseReleases: [{ ...portable.baseReleases[0], identity: `sha256:${'0'.repeat(64)}` }] }, verified),
  /immutable portable base/);
});

test('rejects modified, untrusted, stale, duplicate, or malformed signed content', () => {
  const tampered = JSON.parse(signed().toString());
  tampered.payload_base64 = Buffer.from('{}').toString('base64');
  assert.throws(() => verifyReleaseContent(Buffer.from(JSON.stringify(tampered)), trust, 150));
  assert.throws(() => verifyReleaseContent(signed(), { ...trust, keyId: 'other' }, 150));
  assert.throws(() => verifyReleaseContent(signed(), trust, 200));
  assert.throws(() => verifyReleaseContent(signed(), trust, 99));
  assert.throws(() => verifyReleaseContent(signed({ releases: [release, release] }), trust, 150));
  for (const invalid of [
    { ...release, content: [content[0], content[0]] },
    { ...release, content: [{ ...content[0], id: '../escape' }] },
    { ...release, content: [{ ...content[0], size: 0 }] },
    { ...release, content: [{ ...content[0], size: 16 * 1024 * 1024 + 1 }] },
    { ...release, content: [{ ...content[0], url: 'http://example.test/archive' }] },
    { ...release, content: [{ ...content[0], url: 'https://user@example.test/archive' }] },
    { ...release, content: [{ ...content[0], kind: 'runtime_plugin' }] },
    { ...release, unknown: true },
  ]) assert.throws(() => verifyReleaseContent(signed({ releases: [invalid] }), trust, 150));
});

test('content checkpoint rejects rollback, equivocation and rewritten reappearance', () => {
  const first = verifyReleaseContent(signed(), trust, 150);
  const absent = verifyReleaseContent(signed({ revision: 2, releases: [] }), trust, 150, first.checkpoint);
  assert.deepEqual(absent.checkpoint.release_identities, first.checkpoint.release_identities);
  assert.throws(() => verifyReleaseContent(signed(), trust, 150, absent.checkpoint), /rollback/);
  assert.throws(() => verifyReleaseContent(signed({ releases: [] }), trust, 150, first.checkpoint), /equivocation/);
  assert.throws(() => verifyReleaseContent(signed({ revision: 3, releases: [{ ...release,
    content: [{ ...content[0], size: 124 }] }] }), trust, 150, absent.checkpoint), /content changed/);
  const reordered = { content: content.map((item) => ({ size: item.size, digest: item.digest,
    url: item.url, kind: item.kind, id: item.id })), base_release_identity: release.base_release_identity,
  base_kind: release.base_kind, version: release.version, plugin_id: release.plugin_id };
  const next = verifyReleaseContent(signed({ revision: 2, releases: [reordered] }), trust, 150, first.checkpoint);
  assert.deepEqual(next.checkpoint.release_identities, first.checkpoint.release_identities);
});
