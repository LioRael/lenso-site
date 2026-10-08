import assert from 'node:assert/strict';

export function validatePublishedCatalogProof(directory, sources) {
  const [linked, portable, packages, content] = sources;
  const provenance = linked.provenance;
  const keyless = Boolean(provenance);
  assert.equal(directory.schema, 'lenso.site.signed-plugin-directory.v1');
  assert.equal(directory.verification, keyless
    ? 'publisher-provenance-verified-at-build' : 'signature-verified-at-build');
  assert.deepEqual(directory.provenance, provenance);
  if (keyless) {
    assert.deepEqual(Object.keys(provenance).sort(), ['kind', 'catalogId', 'revision',
      'catalogDigest', 'catalogSize', 'bundleDigest', 'bundleSize', 'sourceSha'].sort());
    assert.equal(provenance.kind, 'keyless');
    assert.equal(provenance.catalogId, 'lenso-official-v2');
    assert.ok(Number.isSafeInteger(provenance.revision) && provenance.revision > 0);
    assert.match(provenance.catalogDigest, /^[a-f0-9]{64}$/u);
    assert.match(provenance.bundleDigest, /^[a-f0-9]{64}$/u);
    assert.match(provenance.sourceSha, /^[a-f0-9]{40}$/u);
    for (const size of [provenance.catalogSize, provenance.bundleSize]) {
      assert.ok(Number.isSafeInteger(size) && size > 0);
    }
    for (const source of sources) {
      assert.deepEqual(source.provenance, provenance);
      assert.equal(source.catalogId, provenance.catalogId);
      assert.equal(source.revision, provenance.revision);
      assert.equal(source.expiresAt, null);
    }
    assert.equal(portable.detailsRevision, null);
    assert.equal(portable.detailsExpiresAt, null);
  } else {
    assert.ok(sources.every(source => source.provenance === undefined));
  }
  const metadata = source => ({ catalogId: source.catalogId, revision: source.revision, expiresAt: source.expiresAt });
  assert.deepEqual(directory.catalogs, {
    linkedCargo: metadata(linked),
    portable: { ...metadata(portable), detailsRevision: portable.detailsRevision, detailsExpiresAt: portable.detailsExpiresAt },
    package: metadata(packages), optionalSourceContent: metadata(content),
  });
  const byKind = { linked_cargo: linked, portable_bundle: portable, npm_package: packages };
  for (const release of directory.releases) {
    for (const distribution of release.distributions) {
      const source = byKind[distribution.kind];
      assert.ok(source, 'Unknown published distribution channel');
      assert.deepEqual(distribution.provenance, source.provenance);
      assert.equal(distribution.catalogId, source.catalogId);
      assert.equal(distribution.catalogRevision, source.revision);
      assert.equal(distribution.expiresAt, source.expiresAt);
      if (distribution.kind === 'portable_bundle') {
        assert.equal(distribution.detailsRevision, portable.detailsRevision);
        assert.equal(distribution.detailsExpiresAt, portable.detailsExpiresAt);
      }
    }
    for (const item of release.optionalSourceContent) {
      assert.deepEqual(item.provenance, content.provenance);
      assert.equal(item.catalogId, content.catalogId);
      assert.equal(item.catalogRevision, content.revision);
      assert.equal(item.expiresAt, content.expiresAt);
    }
  }
}
