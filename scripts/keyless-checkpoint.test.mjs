import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { keylessCheckpointConfig, loadKeylessCheckpoint } from './keyless-checkpoint.mjs';

test('keyless checkpoint has no implicit reset or bootstrap', async () => {
  assert.deepEqual(keylessCheckpointConfig({}), { mode: 'deployed', bootstrap: false });
  await assert.rejects(loadKeylessCheckpoint(keylessCheckpointConfig({}), async () => new Response('', { status: 404 })));
  assert.deepEqual(await loadKeylessCheckpoint(keylessCheckpointConfig({ LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_BOOTSTRAP: '1' }),
    async () => new Response('', { status: 404 })), { previous: null, inputDigest: null });
  await assert.rejects(loadKeylessCheckpoint(keylessCheckpointConfig({}), async () => Response.json({ corrupt: true })), undefined);
  await assert.rejects(loadKeylessCheckpoint(keylessCheckpointConfig({ LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_BOOTSTRAP: '1' }),
    async () => new Response('', { status: 503 })));
  await assert.rejects(loadKeylessCheckpoint(keylessCheckpointConfig({}), async (url, options) => {
    assert.equal(url, 'https://lenso.dev/.well-known/lenso-marketplace-checkpoint.json');
    assert.equal(options.cache, 'no-store'); assert.equal(options.redirect, 'error');
    return new Response('x'.repeat(4 * 1024 * 1024 + 1));
  }));
  assert.throws(() => keylessCheckpointConfig({ LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_OUTPUT: '/tmp/next' }));
  assert.throws(() => keylessCheckpointConfig({ LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_OUTPUT: '/tmp/next',
    LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_INPUT: '/tmp/next' }));
  const bootstrap = keylessCheckpointConfig({ LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_OUTPUT: '/tmp/next',
    LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_BOOTSTRAP: '1' });
  assert.deepEqual(await loadKeylessCheckpoint(bootstrap), { previous: null, inputDigest: null });
  await assert.rejects(loadKeylessCheckpoint({ input: '/missing/previous-checkpoint' }));
});

test('input checkpoint rejects corrupt JSON and symlink inputs', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'site-keyless-checkpoint-test-'));
  const input = join(directory, 'input.json');
  await writeFile(input, 'invalid');
  await assert.rejects(loadKeylessCheckpoint({ input }));
  await writeFile(input, '{}');
  const alias = join(directory, 'alias.json');
  await symlink(input, alias);
  await assert.rejects(loadKeylessCheckpoint({ input: alias }));
});
