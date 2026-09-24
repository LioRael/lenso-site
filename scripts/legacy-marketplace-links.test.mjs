import assert from 'node:assert/strict';
import test from 'node:test';
import { legacyMarketplaceDestination } from '../lib/legacy-marketplace-links.mjs';

const releases = [['lenso.web-ingress', '0.4.5'], ['example.web', '1.0.0']];

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

test('keeps ordinary homepage and incomplete or ambiguous legacy links separate', () => {
  assert.equal(legacyMarketplaceDestination('?q=web', releases), null);
  assert.deepEqual(legacyMarketplaceDestination('?plugin=example.web', releases), { kind: 'unavailable' });
  assert.deepEqual(legacyMarketplaceDestination('?plugin=example.web&plugin=other&version=1.0.0', releases), { kind: 'unavailable' });
});
