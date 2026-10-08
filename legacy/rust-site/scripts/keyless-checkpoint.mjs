import assert from 'node:assert/strict';
import { lstat, readFile, writeFile, open, link, unlink, realpath, mkdir } from 'node:fs/promises';
import { resolve, dirname, join, basename, isAbsolute, relative } from 'node:path';
import { randomUUID } from 'node:crypto';
import { digest, readBoundedFile } from './keyless-publisher/verify.mjs';
import { fetchBounded, validateKeylessCheckpoint } from './keyless-catalog.mjs';

export const deployedCheckpointUrl = 'https://lenso.dev/.well-known/lenso-marketplace-checkpoint.json';

const generated = resolve(import.meta.dirname, '../lib/.generated');
const pending = join(generated, 'keyless-checkpoint.pending.json');
const files = ['linked-catalog', 'portable-catalog', 'package-catalog', 'release-content', 'linked-documents'];
const outputDigest = async () => digest(Buffer.concat(await Promise.all(files.map((file) => readFile(join(generated, `${file}.json`))))));

export function keylessCheckpointConfig(env) {
  const input = env.LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_INPUT;
  const output = env.LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_OUTPUT;
  const bootstrap = env.LENSO_MARKETPLACE_KEYLESS_CHECKPOINT_BOOTSTRAP;
  if (!input && !output) {
    assert.ok(!bootstrap || bootstrap === '1', 'Invalid bootstrap flag');
    return { mode: 'deployed', bootstrap: bootstrap === '1' };
  }
  assert.ok(output && isAbsolute(output) && ((input && isAbsolute(input) && !bootstrap) || (!input && bootstrap === '1')),
    'Keyless ingestion requires absolute checkpoint output and input or explicit one-time bootstrap');
  assert.ok(!input || resolve(input) !== resolve(output));
  return { mode: 'external', input, output };
}

export async function loadKeylessCheckpoint(config, fetcher = fetch) {
  if (config.mode === 'deployed') {
    const response = await fetcher(deployedCheckpointUrl, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000) });
    if (response.status === 404 && config.bootstrap) return { previous: null, inputDigest: null };
    assert.ok(response.ok, 'Previously deployed keyless checkpoint is missing; refusing to reset history');
    const bytes = await fetchBounded(deployedCheckpointUrl, async () => response);
    return { previous: validateKeylessCheckpoint(JSON.parse(bytes.toString('utf8'))), inputDigest: digest(bytes) };
  }
  if (!config.input) return { previous: null, inputDigest: null };
  const bytes = await readBoundedFile(config.input);
  return { previous: validateKeylessCheckpoint(JSON.parse(bytes.toString('utf8'))), inputDigest: digest(bytes) };
}

export async function stageKeylessCheckpoint(config, checkpoint, inputDigest) {
  await writeFile(pending, JSON.stringify({ mode: config.mode, output: config.output, checkpoint, inputDigest, outputDigest: await outputDigest() }));
}

export async function publishKeylessCheckpoint(config) {
  const candidate = JSON.parse((await readBoundedFile(pending)).toString('utf8'));
  assert.equal(candidate.output, config.output);
  assert.equal(candidate.mode, config.mode);
  validateKeylessCheckpoint(candidate.checkpoint);
  assert.equal(candidate.outputDigest, await outputDigest(), 'Generated files changed since verification');
  assert.equal(candidate.inputDigest, (await loadKeylessCheckpoint(config)).inputDigest, 'Previously accepted checkpoint changed during build');
  if (config.mode === 'deployed') {
    const repository = resolve(import.meta.dirname, '..');
    const staticRoot = resolve(repository, process.env.NEXT_OUTPUT_ROOT || 'out');
    const suffix = relative(repository, staticRoot);
    assert.ok(suffix && !suffix.startsWith('..') && !isAbsolute(suffix), 'Static output root must be within repository');
    const output = join(staticRoot, '.well-known/lenso-marketplace-checkpoint.json');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify(candidate.checkpoint)}\n`, { flag: 'wx' });
    return;
  }
  const parent = await realpath(dirname(config.output));
  const repository = await realpath(resolve(import.meta.dirname, '..'));
  const suffix = relative(repository, parent);
  assert.ok(suffix.startsWith('..') || isAbsolute(suffix), 'Checkpoint output must be outside repository');
  try { await lstat(config.output); throw new Error('Checkpoint output already exists'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temporary = join(parent, `.${basename(config.output)}.${randomUUID()}.tmp`);
  const handle = await open(temporary, 'wx', 0o600);
  try { await handle.writeFile(`${JSON.stringify(candidate.checkpoint)}\n`); await handle.sync(); }
  finally { await handle.close(); }
  try { await link(temporary, config.output); }
  finally { await unlink(temporary).catch(() => {}); }
}
