import assert from 'node:assert/strict';
import test from 'node:test';
import { legacyMarketplaceDestination, signedLegacyMarketplaceReleases } from '../lib/legacy-marketplace-links.mjs';

const releases = [['lenso.web-ingress', '0.4.5'], ['example.web', '1.0.0']];

test('collects signed npm-only releases without treating an unsigned candidate as a legacy release', () => {
  const signed = signedLegacyMarketplaceReleases(
    [{ pluginId: 'example.linked', version: '1.0.0' }],
    [{ pluginId: 'example.portable', version: '2.0.0' }],
    [{ pluginId: 'example.npm-only', version: '3.0.0' }],
  );
  assert.deepEqual(legacyMarketplaceDestination('?plugin=example.npm-only&version=3.0.0', signed),
    { kind: 'release', href: '/plugins/example.npm-only/3.0.0/' });
  assert.deepEqual(legacyMarketplaceDestination('?plugin=lenso.web-ingress&version=0.4.5', signed),
    { kind: 'unavailable', pluginId: 'lenso.web-ingress', version: '0.4.5' });
});

test('keeps exact legacy release identity while discarding browse filters', () => {
  assert.deepEqual(
    legacyMarketplaceDestination('?q=web&plugin=example.web&version=1.0.0&offset=30', releases),
    { kind: 'release', href: '/plugins/example.web/1.0.0/' },
  );
});

test('does not replace an unknown exact version with a candidate or latest version', () => {
  assert.deepEqual(
    legacyMarketplaceDestination('?plugin=lenso.web-ingress&version=0.4.4', releases),
    { kind: 'unavailable', pluginId: 'lenso.web-ingress', version: '0.4.4' },
  );
});

test('keeps a plain legacy search query on the signed Site directory', () => {
  assert.deepEqual(legacyMarketplaceDestination('?q=web', releases), { kind: 'browse', href: '/plugins/?q=web' });
  assert.deepEqual(legacyMarketplaceDestination('?view=browse&q=hello%20world', releases), { kind: 'browse', href: '/plugins/?q=hello%20world' });
});

test('does not silently translate unsupported legacy filters or views', () => {
  for (const query of ['?q=web&publisher=example', '?q=web&license=MIT', '?q=web&offset=30', '?view=saved&q=web', '?q=one&q=two']) {
    assert.equal(legacyMarketplaceDestination(query, releases), null, query);
  }
});

test('keeps ordinary homepage and incomplete or ambiguous legacy links separate', () => {
  assert.equal(legacyMarketplaceDestination('?utm_source=old-market', releases), null);
  assert.deepEqual(legacyMarketplaceDestination('?plugin=example.web', releases), { kind: 'unavailable' });
  assert.deepEqual(legacyMarketplaceDestination('?plugin=example.web&plugin=other&version=1.0.0', releases), { kind: 'unavailable' });
});
