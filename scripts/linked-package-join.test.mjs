import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { verifyLinkedCatalog } from './linked-catalog.mjs';
import { assertIndependentPackageIdentities, verifyPackageCatalog } from './package-catalog.mjs';
import { joinLinkedPackageReleaseDetails, verifyReleaseDetails } from './release-details.mjs';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = { catalogId: 'test', keyId: 'key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex') };
const linkedRelease = {
  plugin_id: 'example.dual', version: '1.2.3', publisher_id: 'example', title: 'Dual Plugin',
  summary: 'One Plugin with Cargo and npm distributions', source_url: 'https://example.test/source',
  source_revision: 'a'.repeat(40), license: 'MIT', package: 'example-dual',
  registry_url: 'https://crates.io', crate_digest: `sha256:${'b'.repeat(64)}`,
  integration: 'linked_plugin', targets: ['aarch64-apple-darwin'], availability: 'listed',
};
const npmDistribution = { id: 'bun', kind: 'npm_package', package: '@example/dual',
  version: '1.2.3', integrity: `sha256:${'c'.repeat(64)}`,
  registry_url: 'https://registry.npmjs.org', targets: ['workers'] };
const packageRelease = {
  plugin_id: linkedRelease.plugin_id, version: linkedRelease.version,
  publisher_id: linkedRelease.publisher_id, title: linkedRelease.title,
  summary: linkedRelease.summary, source_url: linkedRelease.source_url,
  source_revision: linkedRelease.source_revision, license: linkedRelease.license,
  distributions: [npmDistribution], availability: 'listed',
};
const identity = `sha256:${createHash('sha256').update(JSON.stringify([
  linkedRelease.plugin_id, linkedRelease.version, linkedRelease.publisher_id, linkedRelease.title,
  linkedRelease.summary, linkedRelease.source_url, linkedRelease.source_revision,
  linkedRelease.license, linkedRelease.package, linkedRelease.registry_url,
  linkedRelease.crate_digest, linkedRelease.integration, linkedRelease.targets,
])).digest('hex')}`;
const detailsRelease = {
  plugin_id: linkedRelease.plugin_id, version: linkedRelease.version, base_release_identity: identity,
  distributions: [
    { id: 'cargo', kind: 'cargo_package', package: linkedRelease.package,
      version: linkedRelease.version, registry_url: linkedRelease.registry_url,
      integrity: linkedRelease.crate_digest, targets: linkedRelease.targets },
    npmDistribution,
  ],
};

function signed(schema, releases) {
  const payload = Buffer.from(JSON.stringify({ schema, catalog_id: trust.catalogId,
    revision: 1, issued_at: 100, expires_at: 200, releases }));
  return Buffer.from(JSON.stringify({ key_id: trust.keyId, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, Buffer.concat([Buffer.from(`${schema}\0${trust.keyId}\0`), payload]), privateKey).toString('base64') }));
}
function verified(linked = linkedRelease, npm = packageRelease, details = detailsRelease) {
  const cargo = verifyLinkedCatalog(signed('lenso.marketplace.linked-cargo-snapshot.v1', [linked]), trust, 150);
  const packages = verifyPackageCatalog(signed('lenso.marketplace.package-snapshot.v1', [npm]), trust, 150);
  const releases = verifyReleaseDetails(signed('lenso.marketplace.release-details.v1', [details]), trust, 150);
  return [cargo, packages, releases];
}

test('joins only separately signed exact linked Cargo and npm distributions', () => {
  const [cargo, packages, details] = verified();
  assert.equal(cargo.baseReleases[0].identity, identity);
  const joins = joinLinkedPackageReleaseDetails(cargo, packages, details);
  assert.deepEqual([...joins], ['example.dual@1.2.3']);
  assert.doesNotThrow(() => assertIndependentPackageIdentities(packages, cargo, null, {}, joins));
  assert.throws(() => assertIndependentPackageIdentities(packages, cargo, null), /conflicts/);
});

test('rejects a same-name release without exact signed details or matching provenance', () => {
  const [cargo, packages, details] = verified();
  for (const changed of [
    { ...detailsRelease, base_release_identity: `sha256:${'0'.repeat(64)}` },
    { ...detailsRelease, distributions: [{ ...detailsRelease.distributions[0], integrity: `sha256:${'0'.repeat(64)}` }, npmDistribution] },
    { ...detailsRelease, distributions: [{ ...detailsRelease.distributions[0], targets: ['x86_64-unknown-linux-gnu'] }, npmDistribution] },
    { ...detailsRelease, distributions: [detailsRelease.distributions[0], { ...npmDistribution, integrity: `sha256:${'0'.repeat(64)}` }] },
    { ...detailsRelease, distributions: [npmDistribution] },
    { ...detailsRelease, distributions: [...detailsRelease.distributions,
      { id: 'portable', kind: 'portable_bundle', package: linkedRelease.plugin_id,
        version: linkedRelease.version, artifact: { url: 'https://example.test/bundle',
          digest: `sha256:${'d'.repeat(64)}`, size: 123, manifest_digest: `sha256:${'e'.repeat(64)}` } }] },
  ]) {
    const changedDetails = verifyReleaseDetails(signed('lenso.marketplace.release-details.v1', [changed]), trust, 150);
    assert.throws(() => joinLinkedPackageReleaseDetails(cargo, packages, changedDetails));
  }
  const changedPackage = verified(linkedRelease, { ...packageRelease, publisher_id: 'another' })[1];
  assert.throws(() => joinLinkedPackageReleaseDetails(cargo, changedPackage, details), /provenance/);
  assert.throws(() => joinLinkedPackageReleaseDetails(cargo, packages, { ...details, releases: [] }), /do not bind/);
});

test('history and unavailable releases cannot silently become a combined listing', () => {
  const [cargo, packages, details] = verified();
  assert.throws(() => joinLinkedPackageReleaseDetails(
    verified({ ...linkedRelease, availability: 'yanked' })[0], packages, details), /listed/);
  assert.throws(() => joinLinkedPackageReleaseDetails(cargo,
    verified(linkedRelease, { ...packageRelease, availability: 'yanked' })[1], details), /listed/);
  const joins = joinLinkedPackageReleaseDetails(cargo, packages, details);
  assert.throws(() => assertIndependentPackageIdentities(null, cargo, null,
    { package: packages.checkpoint }, joins), /conflicts/);
  assert.throws(() => assertIndependentPackageIdentities(packages, cargo, null,
    { portable: { release_identities: { 'example.dual@1.2.3': `sha256:${'a'.repeat(64)}` } } }, joins), /conflicts/);
});
