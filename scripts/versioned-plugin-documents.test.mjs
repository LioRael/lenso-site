import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { versionedPluginDocuments } from '../lib/versioned-plugin-documents.ts';

const content = '# Exact release\n\nUse this version.\n';
const digest = `sha256:${createHash('sha256').update(content).digest('hex')}`;
const pluginId = 'example.web';
const version = '1.2.3';
const slug = 'linked-example';
const document = {
  id: 'quickstart', revision: '2', language: 'en', topic: 'Getting started',
  url: 'https://docs.example.test/quickstart.md', digest, slug,
  pageUrl: `/plugins/${pluginId}/${version}/docs/${slug}`,
  markdownUrl: `/api/plugins/${pluginId}/${version}/docs/${slug}/content.md`,
};
const verified = {
  [slug]: {
    pluginId, version, channel: 'linked', slug, documentId: document.id,
    revision: document.revision, language: document.language, topic: document.topic,
    target: null, sourceUrl: document.url, digest, content,
  },
};
const release = {
  pluginId, version, apiUrl: `/api/plugins/releases/${pluginId}/${version}/release.json`,
  distributions: [{
    kind: 'linked_cargo', catalogId: 'official', catalogRevision: 7, expiresAt: 99,
    release: { documentation: [document] },
  }],
};

test('exact signed version gives human and Agent the same document revision', () => {
  const index = versionedPluginDocuments(release, verified);
  assert.equal(index.schema, 'lenso.site.plugin-documents.v1');
  assert.equal(index.selection, 'exact-version-only');
  assert.equal(index.pluginId, pluginId);
  assert.equal(index.version, version);
  assert.deepEqual(index.documents, [{
    documentId: 'quickstart', revision: '2', language: 'en', topic: 'Getting started',
    target: null, channel: 'linked', digest, sourceUrl: document.url,
    pageUrl: document.pageUrl, markdownUrl: document.markdownUrl,
    catalogId: 'official', catalogRevision: 7, expiresAt: 99,
  }]);
  assert.equal(versionedPluginDocuments(undefined, verified), null);
});

test('release metadata, verified body and exact release identity must agree', () => {
  assert.throws(() => versionedPluginDocuments(release, { [slug]: { ...verified[slug], content: 'tampered' } }), /body changed/);
  assert.throws(() => versionedPluginDocuments(release, { [slug]: { ...verified[slug], version: '1.2.4' } }), /metadata and verified body differ/);
  assert.throws(() => versionedPluginDocuments(release, { [slug]: { ...verified[slug], revision: '3' } }), /metadata and verified body differ/);
  assert.throws(() => versionedPluginDocuments(release, {}), /metadata and verified body differ/);
  assert.throws(() => versionedPluginDocuments({ ...release, distributions: [] }, verified), /no signed release reference/);
});

test('channels with the same document ID and revision keep distinct identities', () => {
  const portableSlug = 'portable-example';
  const portable = { ...document, slug: portableSlug,
    pageUrl: `/plugins/${pluginId}/${version}/docs/${portableSlug}`,
    markdownUrl: `/api/plugins/${pluginId}/${version}/docs/${portableSlug}/content.md` };
  const both = {
    ...verified,
    [portableSlug]: { ...verified[slug], channel: 'portable', slug: portableSlug },
  };
  const indexed = versionedPluginDocuments({ ...release, distributions: [
    ...release.distributions,
    { kind: 'portable_bundle', catalogId: 'official', catalogRevision: 5, expiresAt: 90,
      detailsRevision: 6, detailsExpiresAt: 80, release: { documentation: [portable] } },
  ] }, both);
  assert.deepEqual(indexed.documents.map((item) => [item.channel, item.documentId, item.revision, item.catalogRevision]), [
    ['linked', 'quickstart', '2', 7],
    ['portable', 'quickstart', '2', 6],
  ]);
});

test('linked details exposed through two distributions are indexed only once', () => {
  const detailsSlug = 'linked_details-example';
  const detailsDocument = { ...document, slug: detailsSlug,
    pageUrl: `/plugins/${pluginId}/${version}/docs/${detailsSlug}`,
    markdownUrl: `/api/plugins/${pluginId}/${version}/docs/${detailsSlug}/content.md` };
  const detailsVerified = { ...verified,
    [detailsSlug]: { ...verified[slug], channel: 'linked_details', slug: detailsSlug } };
  const detailsRelease = { ...release, distributions: [
    { ...release.distributions[0], release: { documentation: [document], details: {
      revision: 9, expiresAt: 77, documentation: [detailsDocument],
    } } },
    { kind: 'npm_package', provenance: 'linked_release_details', catalogId: 'official',
      catalogRevision: 9, expiresAt: 77, release: { documentation: [detailsDocument] } },
  ] };
  const index = versionedPluginDocuments(detailsRelease, detailsVerified);
  assert.equal(index.documents.length, 2);
  assert.deepEqual(index.documents.find((item) => item.channel === 'linked_details')?.catalogRevision, 9);
});
