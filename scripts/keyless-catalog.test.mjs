import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { admitCatalog, normalizeCatalog, validateCurrent, fetchBounded } from './keyless-catalog.mjs';
import { digest } from './keyless-publisher/verify.mjs';
import { matchesVerifiedHead, confirmVerifiedHead, marketplaceCommand } from './keyless-currentness.mjs';

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
