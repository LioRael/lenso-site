import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { documentSlug, ingestLinkedDocuments } from './linked-documents.mjs';

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
