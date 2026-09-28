import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  exactVersionDocuments,
  languageChoices,
  scopedSearchMatches,
  versionChoices,
} from '../lib/plugin-document-navigation.ts';

const document = (pluginId, version, slug, overrides = {}) => ({
  pluginId,
  version,
  slug,
  documentId: 'start',
  revision: 'r1',
  language: 'en',
  topic: 'Getting started',
  channel: 'package',
  target: null,
  url: `/plugins/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}/docs/${slug}`,
  ...overrides,
});

const docs = [
  document('example.editor', '1.0.0', 'v1-en'),
  document('example.editor', '1.0.0', 'v1-zh', { language: 'zh', revision: 'r2' }),
  document('example.editor', '2.0.0', 'v2-en'),
  document('example.editor', '2.0.0', 'v2-other-channel', { channel: 'content' }),
  document('example.editor', '2.0.0', 'v2-other-target', { target: 'aarch64-apple-darwin' }),
  document('example.editor.extra', '1.0.0', 'other-plugin'),
];

test('search accepts only exact Plugin ID and version URLs, even when IDs share a prefix', () => {
  const urls = [docs[2].url, docs[5].url, docs[0].url, docs[1].url, docs[0].url];
  assert.deepEqual(scopedSearchMatches(urls, docs, 'example.editor', '1.0.0').map((item) => item.slug),
    ['v1-en', 'v1-zh']);
  assert.deepEqual(exactVersionDocuments(docs, 'example.editor', '1.0.0').map((item) => item.slug),
    ['v1-en', 'v1-zh']);
  assert.deepEqual(scopedSearchMatches(urls, docs, 'example.editor', '3.0.0'), []);
  assert.deepEqual(scopedSearchMatches(urls, docs, 'example.editor', '1.0.0', 1).map((item) => item.slug),
    ['v1-en']);
});

test('version navigation chooses the same exact document or the selected release overview', () => {
  const choices = versionChoices(['1.0.0', '2.0.0', '3.0.0'], docs, 'example.editor', docs[0]);
  assert.deepEqual(choices, [
    { version: '1.0.0', url: docs[0].url, sameDocument: true },
    { version: '2.0.0', url: docs[2].url, sameDocument: true },
    { version: '3.0.0', url: '/plugins/example.editor/3.0.0', sameDocument: false },
  ]);
  assert.deepEqual(versionChoices(['3.0.0'], docs, 'example.editor'), [
    { version: '3.0.0', url: '/plugins/example.editor/3.0.0', sameDocument: false },
  ]);
  assert.deepEqual(versionChoices(['2.0.0'], docs, 'example.editor', docs[1]), [
    { version: '2.0.0', url: '/plugins/example.editor/2.0.0', sameDocument: false },
  ]);
  assert.deepEqual(versionChoices(['1.0.0'], docs, 'example.editor', docs[3]), [
    { version: '1.0.0', url: '/plugins/example.editor/1.0.0', sameDocument: false },
  ]);
  assert.deepEqual(versionChoices(['1.0.0'], docs, 'example.editor', docs[4]), [
    { version: '1.0.0', url: '/plugins/example.editor/1.0.0', sameDocument: false },
  ]);
});

test('language navigation stays inside the same Plugin, version, document ID and channel', () => {
  assert.deepEqual(languageChoices(docs, docs[0]).map((item) => item.slug), ['v1-en', 'v1-zh']);
  assert.deepEqual(languageChoices(docs, docs[3]).map((item) => item.slug), ['v2-other-channel']);
  assert.deepEqual(languageChoices(docs, docs[4]).map((item) => item.slug), ['v2-other-target']);
});
