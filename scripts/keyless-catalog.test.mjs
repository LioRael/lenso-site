import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { admitCatalog, normalizeCatalog, validateCurrent, fetchBounded } from './keyless-catalog.mjs';
import { digest } from './keyless-publisher/verify.mjs';
import { matchesVerifiedHead, confirmVerifiedHead, marketplaceCommand, supportsLinkedAdoption } from './keyless-currentness.mjs';
import { validatePublishedCatalogProof } from './published-catalog-proof.mjs';

// Public attested migration input. The descriptor below is a fixture, not a live currentness receipt.
const bytes = await readFile(new URL('./fixtures/keyless-catalog.json', import.meta.url));
const headFor = (raw) => ({ schema: 'lenso.marketplace.keyless-current.v1', catalog_id: 'lenso-official-v2',
  revision: JSON.parse(raw).revision, provenance: { repository: 'LioRael/lenso-marketplace',
    workflow: '.github/workflows/publish-keyless-catalog.yml', ref: 'refs/heads/main', source_sha: 'bda1f4f56d299a6a5e09fe94f14cd685c36c539e' },
  catalog: { sha256: digest(raw), size: raw.length, path: `/api/marketplace/v3/objects/${digest(raw)}.json` },
  bundle: { sha256: 'b1de046e5676593a4582c476acd98206d7511cc7573792b910069d080a3c0eb1', size: 11463,
    path: '/api/marketplace/v3/objects/b1de046e5676593a4582c476acd98206d7511cc7573792b910069d080a3c0eb1.json' } });
const head = headFor(bytes);
const first = admitCatalog(bytes, head);
const mutate = (change) => { const value = JSON.parse(bytes); change(value); const raw = Buffer.from(JSON.stringify(value)); return [raw, headFor(raw)]; };

test('real public migration bytes normalize all four channels without synthesized expiry', () => {
  assert.equal(digest(bytes), 'cf96b4caf1fb0005f05bb9553427313ed112f543b66e49b2477003078ae8eb3d');
  const output = normalizeCatalog(first.catalog, head);
  assert.deepEqual(Object.values(output).map((catalog) => catalog.releases.length), [2, 1, 1, 2]);
  for (const catalog of Object.values(output)) {
    assert.equal(catalog.expiresAt, null);
    assert.equal(catalog.provenance.catalogDigest, head.catalog.sha256);
    assert.ok(catalog.releases.every((release) => release.status === 'listed'));
  }
  assert.equal(output.content.releases[0].metadata.documentation[0].digest,
    first.catalog.releases.find((release) => release.channel === 'release_content').record.metadata.documentation[0].digest);
});

test('head identity, digest, size, future issue and revision must match', () => {
  for (const change of [h => { h.provenance.ref = 'refs/heads/other'; }, h => { h.catalog.path = '/elsewhere'; },
    h => { h.catalog.size += 1; }, h => { h.revision += 1; }, h => { h.catalog.sha256 = '0'.repeat(64); }]) {
    const candidate = structuredClone(head); change(candidate);
    assert.throws(() => admitCatalog(bytes, candidate));
  }
  const [raw, candidate] = mutate(c => { c.issued_at = 9999999999; });
  assert.throws(() => admitCatalog(raw, candidate));
  assert.throws(() => validateCurrent({ ...head, unexpected: true }));
});

test('checkpoint rejects rollback, equivocation, changed or omitted releases and revoked resurrection', () => {
  assert.throws(() => admitCatalog(bytes, head, { ...first.checkpoint, revision: 2 }));
  assert.throws(() => admitCatalog(bytes, head, { ...first.checkpoint, catalog_digest: '0'.repeat(64) }));
  for (const change of [c => { c.revision = 2; c.releases[0].record.summary += ' altered'; },
    c => { c.revision = 2; c.releases.pop(); c.statuses.pop(); }]) {
    const [raw, candidate] = mutate(change);
    assert.throws(() => admitCatalog(raw, candidate, first.checkpoint));
  }
  const [revoked, revokeHead] = mutate(c => { c.revision = 2; c.statuses[0].state = 'revoked'; c.statuses[0].reason = 'security'; });
  const second = admitCatalog(revoked, revokeHead, first.checkpoint);
  const [resurrected, thirdHead] = mutate(c => { c.revision = 3; });
  assert.throws(() => admitCatalog(resurrected, thirdHead, second.checkpoint));
  const output = normalizeCatalog(second.catalog, revokeHead);
  assert.equal(Object.values(output).flatMap(c => c.releases).length, 6);
  assert.ok(Object.values(output).flatMap(c => c.releases).some(r => r.status === 'revoked'));
});

test('currentness compares canonical HTTPS head; errors and changed proof fail closed', async () => {
  const provenance = normalizeCatalog(first.catalog, head).linked.provenance;
  assert.equal(matchesVerifiedHead(head, provenance), true);
  assert.equal(matchesVerifiedHead({ ...head, revision: 2 }, provenance), false);
  assert.equal(matchesVerifiedHead({ ...head, bundle: { ...head.bundle, sha256: '0'.repeat(64) } }, provenance), false);
  assert.equal(matchesVerifiedHead({ ...head, catalog: { ...head.catalog, size: head.catalog.size + 1 } }, provenance), false);
  assert.equal(matchesVerifiedHead({ ...head, bundle: { ...head.bundle, size: head.bundle.size + 1 } }, provenance), false);
  const fetcher = async (url, options) => {
    assert.equal(url, 'https://marketplace.lenso.dev/api/marketplace/v3/current');
    assert.equal(options.cache, 'no-store'); assert.equal(options.redirect, 'error');
    return Response.json(head);
  };
  assert.equal(await confirmVerifiedHead(provenance, fetcher), true);
  assert.equal(await confirmVerifiedHead(provenance, async () => { throw new Error('offline'); }), false);
  assert.equal(await confirmVerifiedHead(provenance, async () => Response.json({ ...head, revision: 2 })), false);
  assert.equal(await confirmVerifiedHead(provenance, async () => new Response(' '.repeat(8193))), false);
  await assert.rejects(fetchBounded('fixture', async () => new Response('x'.repeat(4 * 1024 * 1024 + 1))));
});

test('adoption commands require no user keys and retain explicit source-copy choices', () => {
  assert.equal(marketplaceCommand('lenso app add lenso.cli@1.0.0 --linked-snapshot ./x --trust ./y --crate ./z'), 'lenso app add lenso.cli@1.0.0 --marketplace');
  assert.equal(marketplaceCommand('lenso app add lenso.template@1.0.0 --trust ./y --content-id start --content-destination examples/start --content-preview'),
    'lenso app add lenso.template@1.0.0 --marketplace --content-id start --content-destination examples/start --content-preview');
});

test('normal four-channel commands retain quoted distribution and content choices', () => {
  for (const command of [
    'lenso app add lenso.secrets.env@0.1.7 --marketplace',
    'lenso app add lenso.marketplace.echo@0.1.3 --marketplace',
    "lenso app add lenso.reference.knowledge-excerpt@0.1.2 --marketplace --distribution 'npm'",
    "lenso app add lenso.reference.knowledge-base-starter@0.1.0 --marketplace --content-id 'starter' --content-destination 'examples/starter' --content-preview",
  ]) assert.equal(marketplaceCommand(command), command);
  const quoted = "lenso app add lenso.example@1.0.0 --marketplace --distribution 'publisher'\\''s package'";
  assert.equal(marketplaceCommand(quoted), quoted);
});

test('linked adoption accepts exact official crate URL, preserving Host-only and legacy boundaries', () => {
  const linked = normalizeCatalog(first.catalog, head).linked.releases;
  const secrets = linked.find(release => release.pluginId === 'lenso.secrets.env');
  assert.equal(secrets.registryUrl, 'https://crates.io/crates/lenso-secrets-env-plugin/0.1.7');
  assert.equal(supportsLinkedAdoption(secrets), true);
  assert.equal(supportsLinkedAdoption({ ...secrets, registryUrl: 'https://crates.io' }), true);
  assert.equal(supportsLinkedAdoption(linked.find(release => release.pluginId === 'lenso.web-ingress')), false);
  assert.equal(supportsLinkedAdoption({ ...secrets, integration: 'host_provided' }), false);
  for (const registryUrl of [
    'https://crates.io.evil/crates/lenso-secrets-env-plugin/0.1.7',
    'https://crates.io/crates/other/0.1.7',
    'https://crates.io/crates/lenso-secrets-env-plugin/0.1.6',
    'https://crates.io/crates/lenso-secrets-env-plugin/0.1.7?redirect=elsewhere',
    'https://crates.io/crates/lenso-secrets-env-plugin/0.1.7/',
    'http://crates.io/crates/lenso-secrets-env-plugin/0.1.7',
  ]) assert.equal(supportsLinkedAdoption({ ...secrets, registryUrl }), false);
});

test('published directory requires exact keyless proof and generated metadata, preserving legacy mode', () => {
  const output = normalizeCatalog(first.catalog, head);
  const sources = [output.linked, output.portable, output.package, output.content];
  const metadata = source => ({ catalogId: source.catalogId, revision: source.revision, expiresAt: source.expiresAt });
  const entry = (kind, source) => ({ kind, ...metadata(source), catalogRevision: source.revision,
    provenance: source.provenance, ...(kind === 'portable_bundle'
      ? { detailsRevision: source.detailsRevision, detailsExpiresAt: source.detailsExpiresAt } : {}) });
  const directory = { schema: 'lenso.site.signed-plugin-directory.v1',
    verification: 'publisher-provenance-verified-at-build', provenance: output.linked.provenance,
    catalogs: { linkedCargo: metadata(output.linked),
      portable: { ...metadata(output.portable), detailsRevision: null, detailsExpiresAt: null },
      package: metadata(output.package), optionalSourceContent: metadata(output.content) },
    releases: [{ distributions: [entry('linked_cargo', output.linked), entry('portable_bundle', output.portable),
      entry('npm_package', output.package)], optionalSourceContent: [entry('content_only', output.content)] }] };
  validatePublishedCatalogProof(directory, sources);
  for (const mutate of [
    value => { value.verification = 'signature-verified-at-build'; },
    value => { value.provenance.sourceSha = '0'.repeat(40); },
    value => { value.catalogs.package.revision += 1; },
    value => { value.releases[0].distributions[0].provenance.bundleDigest = '0'.repeat(64); },
    value => { value.releases[0].optionalSourceContent[0].catalogRevision += 1; },
  ]) {
    const changed = structuredClone(directory); mutate(changed);
    assert.throws(() => validatePublishedCatalogProof(changed, sources));
  }
  const mixed = structuredClone(sources); delete mixed[2].provenance;
  assert.throws(() => validatePublishedCatalogProof(directory, mixed));
  const malformed = structuredClone(sources); malformed[0].provenance.catalogSize = 0;
  assert.throws(() => validatePublishedCatalogProof(directory, malformed));
  const legacy = structuredClone(directory);
  const legacySources = structuredClone(sources);
  legacy.verification = 'signature-verified-at-build'; delete legacy.provenance;
  for (const source of legacySources) delete source.provenance;
  for (const item of [...legacy.releases[0].distributions, ...legacy.releases[0].optionalSourceContent]) delete item.provenance;
  validatePublishedCatalogProof(legacy, legacySources);
  legacy.verification = 'publisher-provenance-verified-at-build';
  assert.throws(() => validatePublishedCatalogProof(legacy, legacySources));
});
