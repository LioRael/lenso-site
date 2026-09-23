import { createHash, randomUUID } from 'node:crypto';
import { link, lstat, open, readFile, realpath, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { checkpointSchema, emptyCheckpointBundle, validateCheckpointBundle } from './catalog-checkpoints.mjs';

const maxInputBytes = 32 * 1024 * 1024;
const generatedDirectory = resolve(import.meta.dirname, '../lib/.generated');
export const pendingCheckpointPath = join(generatedDirectory, 'catalog-checkpoint.pending.json');
const generatedFiles = ['linked-catalog.json', 'portable-catalog.json', 'linked-documents.json']
  .map((file) => join(generatedDirectory, file));
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

function under(path, root) {
  const suffix = relative(root, path);
  return suffix === '' || (!suffix.startsWith('..') && !isAbsolute(suffix));
}

export function checkpointConfig(env, hasSignedSources) {
  const input = env.LENSO_MARKETPLACE_CHECKPOINT_INPUT;
  const output = env.LENSO_MARKETPLACE_CHECKPOINT_OUTPUT;
  const bootstrap = env.LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP;
  if (!hasSignedSources) {
    if (input || output || bootstrap) throw new Error('catalog checkpoint configuration needs a signed catalog source');
    return null;
  }
  if (!output || !isAbsolute(output) || !((input && !bootstrap) || (!input && bootstrap === '1'))
    || (input && (!isAbsolute(input) || resolve(input) === resolve(output)))
    || (bootstrap && bootstrap !== '1')) {
    throw new Error('signed Site build requires absolute CHECKPOINT_OUTPUT and exactly one absolute CHECKPOINT_INPUT or CHECKPOINT_BOOTSTRAP=1');
  }
  return { input: input ?? null, output: resolve(output), bootstrap: bootstrap === '1' };
}

export async function loadCheckpointBundle(config, catalogId) {
  if (config.bootstrap) return { bundle: emptyCheckpointBundle(catalogId), inputDigest: null };
  const inputInfo = await stat(config.input);
  if (!inputInfo.isFile() || inputInfo.size > maxInputBytes) throw new Error('Site checkpoint input exceeds limit or is not a file');
  const bytes = await readFile(config.input);
  if (bytes.length > maxInputBytes) throw new Error('Site checkpoint input exceeds limit');
  const bundle = validateCheckpointBundle(JSON.parse(bytes.toString('utf8')), catalogId);
  return { bundle, inputDigest: sha256(bytes) };
}

async function generatedDigest() {
  return sha256(Buffer.concat(await Promise.all(generatedFiles.map((file) => readFile(file)))));
}

export async function stageCheckpointBundle(config, bundle, inputDigest) {
  validateCheckpointBundle(bundle, bundle.catalog_id);
  await writeFile(pendingCheckpointPath, `${JSON.stringify({
    schema: 'lenso.site.pending-checkpoint.v1', output: config.output,
    input_digest: inputDigest, generated_digest: await generatedDigest(), bundle,
  })}\n`);
}

/** Publish a candidate checkpoint only after the complete static build checks pass. */
export async function publishCheckpointCandidate(config, catalogId) {
  const bytes = await readFile(pendingCheckpointPath);
  const pending = JSON.parse(bytes.toString('utf8'));
  if (pending?.schema !== 'lenso.site.pending-checkpoint.v1'
    || pending.output !== config.output || pending.generated_digest !== await generatedDigest()
    || pending.input_digest !== (config.bootstrap ? null : sha256(await readFile(config.input)))) {
    throw new Error('stale or mismatched Site checkpoint candidate');
  }
  validateCheckpointBundle(pending.bundle, catalogId);
  const root = await realpath(resolve(import.meta.dirname, '..'));
  const outputParent = await realpath(dirname(config.output));
  if (under(outputParent, root)) throw new Error('Site checkpoint output must be outside the repository and static artifact');
  try {
    await lstat(config.output);
    throw new Error('Site checkpoint output already exists');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const temporary = join(outputParent, `.${basename(config.output)}.${randomUUID()}.tmp`);
  const handle = await open(temporary, 'wx', 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(pending.bundle)}\n`);
    await handle.sync();
  } finally {
    await handle.close();
  }
  try {
    await link(temporary, config.output); // atomic no-overwrite publication
  } finally {
    // A failed unlink after publication must not turn success into an ambiguous retry.
    await unlink(temporary).catch(() => {});
  }
}

export function nextCheckpointBundle(previous, updates) {
  return {
    schema: checkpointSchema, catalog_id: previous.catalog_id,
    portable: updates.portable ?? previous.portable,
    release_details: updates.release_details ?? previous.release_details,
    linked_cargo: updates.linked_cargo ?? previous.linked_cargo,
  };
}
