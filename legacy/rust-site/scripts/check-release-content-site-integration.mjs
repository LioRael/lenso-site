import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:https';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fixturePath = input('LENSO_SITE_CONTENT_FIXTURE');
const cli = input('LENSO_SITE_CONTENT_CLI');
const receiptPath = process.env.LENSO_SITE_CONTENT_RECEIPT;
if (receiptPath && (!isAbsolute(receiptPath) || receiptPath.startsWith(root + sep))) {
  throw new Error('LENSO_SITE_CONTENT_RECEIPT must be absolute and outside the Site repository');
}
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const trust = JSON.parse(await readFile(fixture.trust, 'utf8'));
const linkedBytes = await readFile(fixture.linked_snapshot);
const contentBytes = await readFile(fixture.release_content);
assert.equal(digest(linkedBytes), fixture.linked_snapshot_sha256);
assert.equal(digest(contentBytes), fixture.release_content_sha256);
const temporary = await mkdtemp(join(tmpdir(), 'lenso-site-release-content-'));
const certificatePath = join(temporary, 'certificate.pem');
const keyPath = join(temporary, 'key.pem');
const checkpointPath = join(temporary, 'checkpoint.json');
const app = join(temporary, 'app');
let server;

try {
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath,
    '-out', certificatePath, '-days', '1', '-subj', '/CN=127.0.0.1',
    '-addext', 'subjectAltName=IP:127.0.0.1',
    '-addext', 'basicConstraints=critical,CA:TRUE',
  ], { stdio: 'ignore' });
  server = createServer({ key: await readFile(keyPath), cert: await readFile(certificatePath) },
    (request, response) => {
      const bytes = request.url === '/linked' ? linkedBytes
        : request.url === '/content' ? contentBytes : null;
      if (!bytes) { response.writeHead(404).end(); return; }
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': bytes.length });
      response.end(bytes);
    });
  await new Promise((success, failure) => server.listen(0, '127.0.0.1', (error) =>
    error ? failure(error) : success()));
  const siteEnvironment = {
    ...process.env,
    NODE_EXTRA_CA_CERTS: certificatePath,
    LENSO_MARKETPLACE_LINKED_CARGO_URL: `https://127.0.0.1:${server.address().port}/linked`,
    LENSO_MARKETPLACE_RELEASE_CONTENT_URL: `https://127.0.0.1:${server.address().port}/content`,
    LENSO_MARKETPLACE_CATALOG_ID: trust.catalog_id,
    LENSO_MARKETPLACE_KEY_ID: trust.key_id,
    LENSO_MARKETPLACE_PUBLIC_KEY_HEX: trust.public_key_hex,
    LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: checkpointPath,
  };
  for (const name of [
    'LENSO_MARKETPLACE_PORTABLE_URL', 'LENSO_MARKETPLACE_RELEASE_DETAILS_URL',
    'LENSO_MARKETPLACE_CHECKPOINT_INPUT', 'LENSO_MARKETPLACE_DOCUMENT_HOSTS',
  ]) delete siteEnvironment[name];
  await run('pnpm', ['build'], root, siteEnvironment);
  const checkpoint = JSON.parse(await readFile(checkpointPath, 'utf8'));
  assert.equal(checkpoint.linked_cargo.revision, 1);
  assert.equal(checkpoint.release_content.revision, 1);
  assert.equal(checkpoint.linked_cargo.release_identities['lenso.auth.api-token@0.1.1'],
    fixture.base_release_identity);
  const page = await readFile(join(root, 'out/plugins/lenso.auth.api-token/0.1.1/index.html'), 'utf8');
  assert.match(page, /Optional source content/);
  assert.match(page, /frontend-template/);
  assert.match(page, /dev-extension/);
  assert.match(page, /--content-preview/);
  assert.match(page, /without running or selecting it/);
  assert.ok(page.includes(fixture.template_sha256));
  assert.ok(page.includes(fixture.extension_sha256));

  await run(cli, ['app', 'create', app, '--runtime', 'empty'], temporary, process.env);
  const results = [];
  for (const item of [
    { id: 'frontend-template', archive: fixture.template_archive,
      digest: fixture.template_sha256, destination: 'examples/frontend-template', expected: 'README.md' },
    { id: 'dev-extension', archive: fixture.extension_archive,
      digest: fixture.extension_sha256, destination: 'extensions/dev-extension', expected: 'package.json' },
  ]) {
    assert.equal(digest(await readFile(item.archive)), item.digest);
    const args = [
      'app', 'add', 'lenso.auth.api-token@0.1.1', '--root', app,
      '--linked-snapshot', fixture.linked_snapshot, '--trust', fixture.trust,
      '--content-snapshot', fixture.release_content, '--content-id', item.id,
      '--content-archive', item.archive, '--content-destination', item.destination,
    ];
    const preview = JSON.parse(execFileSync(cli, [...args, '--content-preview'], {
      cwd: temporary, encoding: 'utf8', env: process.env,
    }));
    assert.equal(preview.kind, 'lenso.signed-release-content-preview');
    assert.equal(preview.content_id, item.id);
    assert.equal(preview.execution, 'not_selected');
    assert.equal(preview.conflict, false);
    assert.ok(preview.files.includes(item.expected));
    await assert.rejects(readFile(join(app, item.destination, item.expected)));
    await run(cli, args, temporary, process.env);
    assert.ok((await readFile(join(app, item.destination, item.expected))).length > 0);
    const attribution = JSON.parse(await readFile(join(app, item.destination, '.lenso-release-content.json'), 'utf8'));
    assert.equal(attribution.content_digest, item.digest);
    assert.equal(attribution.execution, 'not_selected');
    results.push({ id: item.id, destination: item.destination, file_count: preview.files.length,
      execution: attribution.execution });
  }
  await assert.rejects(readFile(join(app, 'plugins/lenso.auth.api-token/default.toml')));
  const receipt = {
    kind: 'lenso.site.release-content-adoption.v2',
    site_script_sha256: digest(await readFile(import.meta.filename)),
    cli_sha256: digest(await readFile(cli)),
    linked_snapshot_sha256: fixture.linked_snapshot_sha256,
    release_content_sha256: fixture.release_content_sha256,
    base_release_identity: fixture.base_release_identity,
    exact_version_page: '/plugins/lenso.auth.api-token/0.1.1',
    results,
    environment: 'local signed fixture, loopback HTTPS static Site build, local CLI preview/copy',
  };
  if (receiptPath) {
    await mkdir(dirname(receiptPath), { recursive: true });
    await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  }
  console.log(`PASS signed v2 Site content -> local CLI preview/copy: ${JSON.stringify(receipt)}`);
} finally {
  if (server) await new Promise((success) => server.close(success));
  await rm(temporary, { recursive: true, force: true });
}

function input(name) {
  const value = process.env[name];
  if (!value || !isAbsolute(value)) throw new Error(`${name} must be an absolute path`);
  return value;
}

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

async function run(command, arguments_, cwd, env) {
  await new Promise((success, failure) => {
    const child = spawn(command, arguments_, { cwd, env, stdio: 'inherit' });
    child.once('error', failure);
    child.once('close', (code) => code === 0 ? success() : failure(new Error(`${command} exited ${code}`)));
  });
}
