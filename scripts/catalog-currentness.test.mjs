import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adoptionIsCurrent, catalogIsCurrent } from './catalog-currentness.mjs';

test('catalog validity ends at the exact expiry boundary', () => {
  assert.equal(catalogIsCurrent(200, 199_999), true);
  assert.equal(catalogIsCurrent(200, 200_000), false);
  assert.equal(catalogIsCurrent(200, 200_001), false);
});

test('unknown validity never enables adoption', () => {
  for (const value of [null, undefined, 0, -1, 0.5, NaN, Infinity]) {
    assert.equal(catalogIsCurrent(value, 0), false);
  }
  assert.equal(adoptionIsCurrent([], 150_000), false);
  assert.equal(adoptionIsCurrent([200, null], 150_000), false);
});

test('optional content requires both base and content catalogs to remain current', () => {
  assert.equal(adoptionIsCurrent([200, 300], 150_000), true);
  assert.equal(adoptionIsCurrent([200, 300], 200_000), false);
  assert.equal(adoptionIsCurrent([300, 200], 200_000), false);
});
