import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { documentSlug, ingestLinkedDocuments, ingestVerifiedDocuments } from './linked-documents.mjs';

const body = Buffer.from('# Verified quickstart\n\nNo MDX executes.\n');
const digest = `sha256:${createHash('sha256').update(body).digest('hex')}`;
const document = {
  id: 'quickstart', revision: 'rev-1', language: 'en', topic: 'Getting started',
  url: 'https://docs.example.test/quickstart.md', digest, size: body.length, media_type: 'text/markdown',
};
const catalog = { releases: [{ pluginId: 'example.web', version: '1.0.0', documentation: [document] }] };
const fetcher = async () => new Response(body, { status: 200 });

test('fetches an approved exact document and retains versioned provenance', async () => {
  const result = await ingestLinkedDocuments(catalog, new Set(['docs.example.test']), fetcher);
  const slug = documentSlug('example.web', '1.0.0', document);
  assert.equal(result[slug].content, body.toString());
  assert.equal(result[slug].digest, digest);
  assert.equal(result[slug].sourceUrl, document.url);
  assert.equal(result[slug].revision, 'rev-1');
});

test('rejects unapproved hosts, changed bodies, size drift and non-UTF-8', async () => {
  await assert.rejects(ingestLinkedDocuments(catalog, new Set(), fetcher), /DOCUMENT_HOSTS/);
  await assert.rejects(ingestLinkedDocuments(catalog, new Set(['other.test']), fetcher), /not approved/);
  await assert.rejects(ingestLinkedDocuments(catalog, new Set(['docs.example.test']),
    async () => new Response(Buffer.from('tampered'), { status: 200 })), /size mismatch/);
  await assert.rejects(ingestLinkedDocuments(catalog, new Set(['docs.example.test']),
    async () => new Response(Buffer.alloc(body.length, 0x41), { status: 200 })), /digest mismatch/);
  const invalid = Buffer.from([0xff]);
  const invalidCatalog = { releases: [{ ...catalog.releases[0], documentation: [{ ...document,
    size: 1, digest: `sha256:${createHash('sha256').update(invalid).digest('hex')}` }] }] };
  await assert.rejects(ingestLinkedDocuments(invalidCatalog, new Set(['docs.example.test']),
    async () => new Response(invalid, { status: 200 })), /encoded data|UTF-8/i);
});

test('an empty signed directory needs no document host configuration', async () => {
  assert.deepEqual(await ingestLinkedDocuments({ releases: [] }, new Set()), {});
});

test('same Plugin/version/document revision in Portable and linked channels never shares a route or body', async () => {
  const portableBody = Buffer.from('# Portable content\n');
  const portableDocument = { ...document, url: 'https://docs.example.test/portable.md',
    digest: `sha256:${createHash('sha256').update(portableBody).digest('hex')}`, size: portableBody.length };
  const portableCatalog = { releases: [{ ...catalog.releases[0], documentation: [portableDocument] }] };
  const result = await ingestVerifiedDocuments([
    { channel: 'linked', catalog }, { channel: 'portable', catalog: portableCatalog },
  ], new Set(['docs.example.test']), async (url, options) => {
    assert.equal(options.redirect, 'error');
    return new Response(url.pathname === '/portable.md' ? portableBody : body, { status: 200 });
  });
  const linkedSlug = documentSlug('example.web', '1.0.0', document);
  const portableSlug = documentSlug('example.web', '1.0.0', portableDocument, 'portable');
  assert.notEqual(linkedSlug, portableSlug);
  assert.equal(result[linkedSlug].channel, 'linked');
  assert.equal(result[portableSlug].channel, 'portable');
  assert.notEqual(result[linkedSlug].content, result[portableSlug].content);
});

test('npm-only documentation has a channel-specific route', () => {
  const linked = documentSlug('example.web', '1.0.0', document);
  const portable = documentSlug('example.web', '1.0.0', document, 'portable');
  const npmPackage = documentSlug('example.web', '1.0.0', document, 'package');
  assert.notEqual(npmPackage, linked);
  assert.notEqual(npmPackage, portable);
  assert.match(npmPackage, /^package-[0-9a-f]{64}$/);
  const linkedDetails = documentSlug('example.web', '1.0.0', document, 'linked_details');
  assert.notEqual(linkedDetails, linked);
  assert.notEqual(linkedDetails, portable);
  assert.notEqual(linkedDetails, npmPackage);
  assert.match(linkedDetails, /^linked_details-[0-9a-f]{64}$/);
});

test('rejects changed hosts, credentialed URLs, redirects and excessive signed sizes', async () => {
  for (const url of ['https://user@docs.example.test/quickstart.md',
    'https://docs.example.test.evil.test/quickstart.md', 'http://docs.example.test/quickstart.md']) {
    const changed = { releases: [{ ...catalog.releases[0], documentation: [{ ...document, url }] }] };
    await assert.rejects(ingestLinkedDocuments(changed, new Set(['docs.example.test']), fetcher), /not approved/);
  }
  const oversized = { releases: [{ ...catalog.releases[0], documentation: [{ ...document, size: 1024 * 1024 + 1 }] }] };
  await assert.rejects(ingestLinkedDocuments(oversized, new Set(['docs.example.test']), fetcher), /size or digest is invalid/);
  await assert.rejects(ingestLinkedDocuments(catalog, new Set(['docs.example.test']),
    async () => ({ ok: true, status: 200, body: {}, headers: new Headers(), redirected: true })), /redirected/);
  await assert.rejects(ingestLinkedDocuments(catalog, new Set(['docs.example.test']),
    async () => ({ ok: true, status: 200, body: {}, headers: new Headers(), url: 'https://other.test/quickstart.md' })), /redirected/);
});
