import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkpointConfig, loadCheckpointBundle, nextCheckpointBundle } from './catalog-checkpoint-files.mjs';
import { emptyCheckpointBundle, validateCheckpointBundle } from './catalog-checkpoints.mjs';

test('no-config build stays empty, while signed builds need explicit bootstrap or durable input/output', () => {
  assert.equal(checkpointConfig({}, false), null);
  assert.throws(() => checkpointConfig({ LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1' }, false));
  assert.throws(() => checkpointConfig({}, true), /CHECKPOINT_OUTPUT/);
  assert.throws(() => checkpointConfig({ LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: '/tmp/next.json' }, true), /CHECKPOINT_INPUT/);
  assert.throws(() => checkpointConfig({
    LENSO_MARKETPLACE_CHECKPOINT_INPUT: '/tmp/prior.json',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: '/tmp/prior.json',
  }, true), /CHECKPOINT_OUTPUT/);
  assert.deepEqual(checkpointConfig({
    LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: '/tmp/next.json',
  }, true), { input: null, output: '/tmp/next.json', bootstrap: true });
});

test('operator checkpoint input is strict, read-only and carries omitted channel histories forward', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'lenso-site-checkpoint-'));
  const input = join(temporary, 'prior.json');
  const config = { input, output: join(temporary, 'next.json'), bootstrap: false };
  try {
    const prior = emptyCheckpointBundle('catalog');
    prior.portable = {
      catalog_id: 'catalog', revision: 2, payload_digest: `sha256:${'a'.repeat(64)}`,
      release_identities: { 'example.old@1.0.0': `sha256:${'b'.repeat(64)}` },
    };
    await writeFile(input, JSON.stringify(prior));
    const loaded = await loadCheckpointBundle(config, 'catalog');
    const next = nextCheckpointBundle(loaded.bundle, { linked_cargo: {
      catalog_id: 'catalog', revision: 1, payload_digest: `sha256:${'c'.repeat(64)}`,
      release_identities: {}, document_identities: {},
    } });
    assert.deepEqual(next.portable, prior.portable, 'absent Portable channel must not erase its historical identity');
    assert.equal(next.linked_cargo.revision, 1);
    assert.notEqual(loaded.inputDigest, null);
    assert.throws(() => checkpointConfig({
      LENSO_MARKETPLACE_CHECKPOINT_INPUT: input,
      LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: config.output,
      LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    }, true));
    await writeFile(input, JSON.stringify({ ...prior, portable: { ...prior.portable, payload_digest: 'bad' } }));
    await assert.rejects(loadCheckpointBundle(config, 'catalog'));
    await writeFile(input, JSON.stringify(prior));
    await assert.rejects(loadCheckpointBundle(config, 'another-catalog'));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('optional content history preserves the old bundle shape and survives channel omission', () => {
  const oldBundle = emptyCheckpointBundle('catalog');
  assert.ok(!Object.hasOwn(nextCheckpointBundle(oldBundle, {}), 'release_content'));
  const content = {
    catalog_id: 'catalog', revision: 1, payload_digest: `sha256:${'a'.repeat(64)}`,
    release_identities: { 'example.web@1.0.0': `sha256:${'b'.repeat(64)}` },
  };
  const next = nextCheckpointBundle(oldBundle, { release_content: content });
  assert.deepEqual(validateCheckpointBundle(next, 'catalog').release_content, content);
  assert.deepEqual(nextCheckpointBundle(next, {}).release_content, content);
  assert.throws(() => validateCheckpointBundle({ ...next,
    release_content: { ...content, document_identities: {} } }, 'catalog'));
});
