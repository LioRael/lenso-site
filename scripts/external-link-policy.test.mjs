import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { assertAllowedExternalUrl, isPublishedSiteUrl } from './external-link-policy.mjs';

test('own-site canonical and locale links must resolve to static pages', (t) => {
  const outputRoot = mkdtempSync(join(tmpdir(), 'lenso-site-links-'));
  t.after(() => rmSync(outputRoot, { recursive: true, force: true }));
  for (const route of ['docs/core/app-quickstart', 'docs/zh/core/app-quickstart']) {
    const directory = join(outputRoot, route);
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, 'index.html'), '<!doctype html>');
  }

  assert.equal(isPublishedSiteUrl(new URL('https://lenso.dev/docs/core/app-quickstart/'), outputRoot), true);
  assert.equal(isPublishedSiteUrl(new URL('https://lenso.dev/docs/zh/core/app-quickstart/'), outputRoot), true);
  assert.throws(
    () => isPublishedSiteUrl(new URL('https://lenso.dev/docs/core/missing/'), outputRoot),
    /no published target/,
  );
  assert.throws(
    () => isPublishedSiteUrl(new URL('http://lenso.dev/docs/core/app-quickstart/'), outputRoot),
    /invalid own-site URL/,
  );
});

test('third-party URLs retain the external host and redirect policy', () => {
  assert.equal(isPublishedSiteUrl(new URL('https://docs.rs/crate/lenso'), '/unused'), false);
  assert.doesNotThrow(() => assertAllowedExternalUrl(new URL('https://docs.rs/crate/lenso')));
  assert.throws(() => assertAllowedExternalUrl(new URL('https://lenso.dev/docs/')), /not allowlisted/);
  assert.throws(() => assertAllowedExternalUrl(new URL('https://lenso.dev.evil.example/')), /not allowlisted/);
  assert.throws(() => assertAllowedExternalUrl(new URL('http://github.com/LioRael/lenso')), /not allowlisted/);
});
