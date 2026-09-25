import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { verifyLinkedCatalog } from './linked-catalog.mjs';
import { assertIndependentPackageIdentities, verifyPackageCatalog } from './package-catalog.mjs';
import { joinLinkedReleaseDetails, verifyReleaseDetails } from './release-details.mjs';

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
const identity = `sha256:${createHash('sha256').update(JSON.stringify([
  linkedRelease.plugin_id, linkedRelease.version, linkedRelease.publisher_id, linkedRelease.title,
  linkedRelease.summary, linkedRelease.source_url, linkedRelease.source_revision,
  linkedRelease.license, linkedRelease.package, linkedRelease.registry_url,
  linkedRelease.crate_digest, linkedRelease.integration, linkedRelease.targets,
])).digest('hex')}`;
const detailRelease = {
  plugin_id: linkedRelease.plugin_id, version: linkedRelease.version, base_release_identity: identity,
  distributions: [
    { id: 'cargo', kind: 'cargo_package', package: linkedRelease.package,
      version: linkedRelease.version, registry_url: linkedRelease.registry_url,
      integrity: linkedRelease.crate_digest, targets: linkedRelease.targets },
    npmDistribution,
  ],
  documentation: [{ id: 'guide', revision: 'v1', language: 'en', topic: 'Guide',
    url: 'https://docs.example.test/guide.md', digest: `sha256:${'d'.repeat(64)}`,
    size: 42, media_type: 'text/markdown' }],
};
const packageOnly = {
  plugin_id: linkedRelease.plugin_id, version: linkedRelease.version,
  publisher_id: linkedRelease.publisher_id, title: linkedRelease.title,
  summary: linkedRelease.summary, source_url: linkedRelease.source_url,
  source_revision: linkedRelease.source_revision, license: linkedRelease.license,
  distributions: [npmDistribution], availability: 'listed',
};

function signed(schema, releases, issuedAt = 100, expiresAt = 200) {
  const payload = Buffer.from(JSON.stringify({ schema, catalog_id: trust.catalogId,
    revision: 1, issued_at: issuedAt, expires_at: expiresAt, releases }));
  return Buffer.from(JSON.stringify({ key_id: trust.keyId, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, Buffer.concat([Buffer.from(`${schema}\0${trust.keyId}\0`), payload]), privateKey).toString('base64') }));
}
function verifiedLinked(release = linkedRelease) {
  return verifyLinkedCatalog(signed('lenso.marketplace.linked-cargo-snapshot.v1', [release]), trust, 150);
}
function verifiedDetails(release = detailRelease) {
  return verifyReleaseDetails(signed('lenso.marketplace.release-details.v1', [release]), trust, 150);
}

test('signed linked + details alone exposes exact npm and versioned docs without a package-only snapshot', () => {
  const linked = verifiedLinked();
  const details = verifiedDetails();
  const joined = joinLinkedReleaseDetails(linked, details);
  assert.equal(linked.baseReleases[0].identity, identity);
  assert.equal(joined.releases.length, 1);
  assert.equal(joined.releases[0].details.baseReleaseIdentity, identity);
  assert.deepEqual(joined.releases[0].details.npmDistributions, [{
    id: 'bun', kind: 'npm_package', package: '@example/dual', version: '1.2.3',
    integrity: npmDistribution.integrity, registryUrl: npmDistribution.registry_url, targets: ['workers'],
  }]);
  assert.deepEqual(joined.releases[0].details.documentation, detailRelease.documentation);
  assert.doesNotThrow(() => assertIndependentPackageIdentities(null, linked, null));
});

test('same-ID package-only snapshot remains forbidden even when linked details are valid', () => {
  const linked = verifiedLinked();
  assert.equal(joinLinkedReleaseDetails(linked, verifiedDetails()).releases[0].details.npmDistributions.length, 1);
  const packages = verifyPackageCatalog(signed('lenso.marketplace.package-snapshot.v1', [packageOnly]), trust, 150);
  assert.throws(() => assertIndependentPackageIdentities(packages, linked, null), /conflicts/);
  assert.throws(() => assertIndependentPackageIdentities(null, linked, null,
    { package: packages.checkpoint }), /conflicts/);
});

test('signed details cannot borrow a linked identity or change its Cargo coordinates', () => {
  const linked = verifiedLinked();
  for (const release of [
    { ...detailRelease, base_release_identity: `sha256:${'0'.repeat(64)}` },
    { ...detailRelease, distributions: [{ ...detailRelease.distributions[0], package: 'another' }, npmDistribution] },
    { ...detailRelease, distributions: [{ ...detailRelease.distributions[0], integrity: `sha256:${'0'.repeat(64)}` }, npmDistribution] },
    { ...detailRelease, distributions: [{ ...detailRelease.distributions[0], targets: ['x86_64-unknown-linux-gnu'] }, npmDistribution] },
    { ...detailRelease, distributions: [npmDistribution] },
    { ...detailRelease, distributions: [...detailRelease.distributions,
      { id: 'portable', kind: 'portable_bundle', package: linkedRelease.plugin_id,
        version: linkedRelease.version, artifact: { url: 'https://example.test/bundle',
          digest: `sha256:${'e'.repeat(64)}`, size: 123, manifest_digest: `sha256:${'f'.repeat(64)}` } }] },
  ]) {
    assert.throws(() => joinLinkedReleaseDetails(linked, verifiedDetails(release)));
  }
  assert.throws(() => joinLinkedReleaseDetails(linked,
    { ...verifiedDetails(), catalogId: 'other' }), /catalogs differ/);
});

test('unlisted Cargo base cannot appear as a current merged release', () => {
  const linked = verifiedLinked({ ...linkedRelease, availability: 'yanked' });
  assert.deepEqual(joinLinkedReleaseDetails(linked, verifiedDetails()).releases, []);
});

async function ingestFixture(withSameIdPackage) {
  const temporary = mkdtempSync(join(tmpdir(), 'lenso-site-linked-details-'));
  const scriptDirectory = join(temporary, 'scripts');
  cpSync(import.meta.dirname, scriptDirectory, { recursive: true });
  mkdirSync(join(temporary, 'lib/.generated'), { recursive: true });
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from('# Verified linked details\n');
  const joinedDetails = { ...detailRelease, documentation: [{ ...detailRelease.documentation[0],
    digest: `sha256:${createHash('sha256').update(body).digest('hex')}`, size: body.length }] };
  const snapshots = new Map([
    ['/linked', signed('lenso.marketplace.linked-cargo-snapshot.v1', [linkedRelease], now - 1, now + 3600)],
    ['/details', signed('lenso.marketplace.release-details.v1', [joinedDetails], now - 1, now + 3600)],
    ['/package', signed('lenso.marketplace.package-snapshot.v1', [packageOnly], now - 1, now + 3600)],
  ]);
  const names = ['LENSO_MARKETPLACE_LINKED_CARGO_URL', 'LENSO_MARKETPLACE_RELEASE_DETAILS_URL',
    'LENSO_MARKETPLACE_PACKAGE_URL', 'LENSO_MARKETPLACE_CATALOG_ID',
    'LENSO_MARKETPLACE_KEY_ID', 'LENSO_MARKETPLACE_PUBLIC_KEY_HEX',
    'LENSO_MARKETPLACE_DOCUMENT_HOSTS', 'LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP',
    'LENSO_MARKETPLACE_CHECKPOINT_OUTPUT'];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const previousFetch = globalThis.fetch;
  Object.assign(process.env, {
    LENSO_MARKETPLACE_LINKED_CARGO_URL: 'https://catalog.example.test/linked',
    LENSO_MARKETPLACE_RELEASE_DETAILS_URL: 'https://catalog.example.test/details',
    LENSO_MARKETPLACE_CATALOG_ID: trust.catalogId,
    LENSO_MARKETPLACE_KEY_ID: trust.keyId,
    LENSO_MARKETPLACE_PUBLIC_KEY_HEX: trust.publicKeyHex,
    LENSO_MARKETPLACE_DOCUMENT_HOSTS: 'docs.example.test',
    LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: join(temporary, 'checkpoint.json'),
  });
  if (withSameIdPackage) process.env.LENSO_MARKETPLACE_PACKAGE_URL = 'https://catalog.example.test/package';
  else delete process.env.LENSO_MARKETPLACE_PACKAGE_URL;
  globalThis.fetch = async (input) => {
    const pathname = new URL(input).pathname;
    return new Response(pathname === '/guide.md' ? body : snapshots.get(pathname),
      { status: snapshots.has(pathname) || pathname === '/guide.md' ? 200 : 404 });
  };
  try {
    await import(pathToFileURL(join(scriptDirectory, 'ingest-linked-catalog.mjs')).href);
    return {
      linked: JSON.parse(readFileSync(join(temporary, 'lib/.generated/linked-catalog.json'), 'utf8')),
      packages: JSON.parse(readFileSync(join(temporary, 'lib/.generated/package-catalog.json'), 'utf8')),
      documents: JSON.parse(readFileSync(join(temporary, 'lib/.generated/linked-documents.json'), 'utf8')),
    };
  } finally {
    globalThis.fetch = previousFetch;
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
    rmSync(temporary, { recursive: true });
  }
}

test('Site ingestion emits joined metadata and Markdown without any package-only snapshot', async () => {
  const output = await ingestFixture(false);
  assert.equal(output.packages.releases.length, 0);
  assert.equal(output.linked.releases[0].details.npmDistributions[0].integrity, npmDistribution.integrity);
  assert.equal(Object.values(output.documents).length, 1);
  assert.equal(Object.values(output.documents)[0].channel, 'linked_details');
});

test('Site ingestion fails closed when a same-ID package-only snapshot is added', async () => {
  await assert.rejects(ingestFixture(true), /package-only identity conflicts/);
});
