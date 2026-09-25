import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createHash, generateKeyPairSync } from 'node:crypto';
import { createServer } from 'node:https';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const cli = input('LENSO_SITE_CLI');
const snapshotPath = input('LENSO_SITE_LINKED_SNAPSHOT');
const trustPath = input('LENSO_SITE_LINKED_TRUST');
const authCratePath = input('LENSO_SITE_AUTH_CRATE');
const secretsCratePath = input('LENSO_SITE_SECRETS_CRATE');
const cargoConfigPath = input('LENSO_SITE_CARGO_CONFIG');
const receiptPath = process.env.LENSO_SITE_RECEIPT;
if (receiptPath && (!isAbsolute(receiptPath) || receiptPath.startsWith(root + sep))) {
  throw new Error('LENSO_SITE_RECEIPT must be absolute and outside the Site repository');
}

const auth = { id: 'lenso.auth.api-token', version: '0.1.1', crate: authCratePath };
const secrets = { id: 'lenso.secrets.env', version: '0.1.7', crate: secretsCratePath };
const temporary = await mkdtemp(join(tmpdir(), 'lenso-site-real-adoption-'));
const certificatePath = join(temporary, 'certificate.pem');
const keyPath = join(temporary, 'key.pem');
const checkpointPath = join(temporary, 'checkpoint.json');
const app = join(temporary, 'app');
const distribution = join(temporary, 'dist');
let server;

try {
  const [snapshotBytes, trustBytes, cargoConfig] = await Promise.all([
    readFile(snapshotPath), readFile(trustPath), readFile(cargoConfigPath),
  ]);
  const snapshotSha256 = digest(snapshotBytes);
  const trust = JSON.parse(trustBytes);
  const envelope = JSON.parse(snapshotBytes);
  const payload = JSON.parse(Buffer.from(envelope.payload_base64, 'base64').toString('utf8'));
  assert.equal(payload.schema, 'lenso.marketplace.linked-cargo-snapshot.v1');
  assert.equal(payload.catalog_id, trust.catalog_id);
  assert.ok(payload.expires_at > Math.floor(Date.now() / 1000), 'signed snapshot expired');
  for (const candidate of [auth, secrets]) {
    const crateBytes = await readFile(candidate.crate);
    const release = payload.releases.find((item) =>
      item.plugin_id === candidate.id && item.version === candidate.version);
    assert.ok(release, `${candidate.id}@${candidate.version} is absent from signed input`);
    assert.equal(release.crate_digest, `sha256:${digest(crateBytes)}`);
    candidate.digest = release.crate_digest;
  }

  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath,
    '-out', certificatePath, '-days', '1', '-subj', '/CN=127.0.0.1',
    '-addext', 'subjectAltName=IP:127.0.0.1',
    '-addext', 'basicConstraints=critical,CA:TRUE',
  ], { stdio: 'ignore' });
  server = createServer({ key: await readFile(keyPath), cert: await readFile(certificatePath) },
    (request, response) => {
      if (request.url !== '/linked-cargo') {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, {
        'content-type': 'application/json', 'content-length': snapshotBytes.length,
      });
      response.end(snapshotBytes);
    });
  await new Promise((success, failure) => server.listen(0, '127.0.0.1', (error) =>
    error ? failure(error) : success()));

  const siteEnvironment = {
    ...process.env,
    NODE_EXTRA_CA_CERTS: certificatePath,
    LENSO_MARKETPLACE_LINKED_CARGO_URL: `https://127.0.0.1:${server.address().port}/linked-cargo`,
    LENSO_MARKETPLACE_CATALOG_ID: trust.catalog_id,
    LENSO_MARKETPLACE_KEY_ID: trust.key_id,
    LENSO_MARKETPLACE_PUBLIC_KEY_HEX: trust.public_key_hex,
    LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: checkpointPath,
  };
  for (const name of [
    'LENSO_MARKETPLACE_PORTABLE_URL', 'LENSO_MARKETPLACE_RELEASE_DETAILS_URL',
    'LENSO_MARKETPLACE_RELEASE_CONTENT_URL',
    'LENSO_MARKETPLACE_CHECKPOINT_INPUT',
  ]) delete siteEnvironment[name];
  await run('pnpm', ['build'], root, siteEnvironment);
  const checkpoint = JSON.parse(await readFile(checkpointPath, 'utf8'));
  assert.equal(checkpoint.linked_cargo.revision, payload.revision);
  assert.ok(checkpoint.linked_cargo.release_identities[`${auth.id}@${auth.version}`]);
  const directory = await readFile(join(root, 'out/plugins/index.html'), 'utf8');
  const page = await readFile(join(root, `out/plugins/${auth.id}/${auth.version}/index.html`), 'utf8');
  assert.match(directory, /lenso\.auth\.api-token/);
  assert.match(page, /lenso app add lenso\.auth\.api-token@0\.1\.1 --linked-snapshot/);
  assert.ok(page.includes(auth.digest), 'version page omitted the exact signed crate digest');
  assert.doesNotMatch(page, /--portable-snapshot|--archive/);

  await mkdir(join(temporary, 'cargo-home'));
  await mkdir(join(temporary, 'tmp'));
  await writeFile(join(temporary, 'cargo-home/config.toml'), cargoConfig);
  const cargoEnvironment = {
    ...process.env,
    CARGO_HOME: join(temporary, 'cargo-home'),
    CARGO_TARGET_DIR: join(temporary, 'target'),
    CARGO_NET_OFFLINE: 'true',
    TMPDIR: join(temporary, 'tmp'),
  };
  await run(cli, ['app', 'create', app, '--web', '--no-install'], temporary, cargoEnvironment);
  for (const candidate of [auth, secrets]) {
    await run(cli, [
      'app', 'add', '--root', app, '--no-install', '--linked-snapshot', snapshotPath,
      '--trust', trustPath, '--crate', candidate.crate, `${candidate.id}@${candidate.version}`,
    ], temporary, cargoEnvironment);
    const lock = JSON.parse(await readFile(join(app, 'vendor/lenso', candidate.id,
      candidate.version, '.lenso-linked-source.json'), 'utf8'));
    assert.equal(lock.crate_digest, candidate.digest);
    assert.equal(lock.plugin_id, candidate.id);
    assert.equal(lock.version, candidate.version);
  }
  assert.equal(digest(await readFile(snapshotPath)), snapshotSha256,
    'Site and CLI did not consume the same immutable signed snapshot bytes');

  const { publicKey } = generateKeyPairSync('ed25519');
  const publicKeyBase64 = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
  await writeFile(join(app, 'plugins', auth.id, 'default.toml'),
    `schema = "site_reference"\nissuer = "site-integration"\nassertion_public_key = "${publicKeyBase64}"\n` +
    'database_url_secret = "auth/database-url"\n' +
    'assertion_signing_key_secret = "auth/signing-secret"\n' +
    'token_pepper_secret = "auth/token-pepper"\nassertion_ttl_seconds = 300\n');
  await writeFile(join(app, 'plugins', secrets.id, 'default.toml'),
    '[references]\n"auth/database-url" = "LENSO_SITE_TEST_DATABASE_URL"\n' +
    '"auth/signing-secret" = "LENSO_SITE_TEST_SIGNING_SECRET"\n' +
    '"auth/token-pepper" = "LENSO_SITE_TEST_TOKEN_PEPPER"\n');
  await run(cli, ['app', 'build', '--root', app, '--out', distribution], temporary, cargoEnvironment);
  const check = execFileSync(cli, ['app', 'check', '--root', distribution],
    { cwd: temporary, env: cargoEnvironment, encoding: 'utf8' }).trim();
  assert.match(check, /App is valid: 4 Plugin Instance\(s\), 2 Capability binding\(s\)/);
  const shown = JSON.parse(execFileSync(cli, ['app', 'show', '--root', join(distribution, 'intent'), '--json'],
    { cwd: temporary, env: cargoEnvironment, encoding: 'utf8' }));
  const instances = new Set(shown.instances.map((instance) => instance.id));
  assert.ok(instances.has(`${auth.id}/default`));
  assert.ok(instances.has(`${secrets.id}/default`));
  assert.ok(shown.bindings.some((binding) => binding.consumer_instance === `${auth.id}/default`
    && binding.provider_instance === `${secrets.id}/default`
    && binding.capability_id === 'lenso.secrets@1'));

  const receipt = {
    kind: 'lenso.site.real-linked-adoption.v1',
    site_script_sha256: digest(await readFile(import.meta.filename)),
    cli_version: execFileSync(cli, ['--version'], { encoding: 'utf8' }).trim(),
    cli_sha256: digest(await readFile(cli)),
    signed_snapshot_sha256: snapshotSha256,
    catalog_id: trust.catalog_id,
    snapshot_revision: payload.revision,
    snapshot_expires_at: payload.expires_at,
    releases: [auth, secrets].map(({ id, version, digest: crateDigest }) =>
      ({ plugin_id: id, version, crate_digest: crateDigest })),
    site_exact_version_page: `/plugins/${auth.id}/${auth.version}`,
    app_check: check,
    app_instances: [...instances].sort(),
    auth_secrets_binding: true,
    environment: 'local signed v1 fixture, loopback HTTPS Site build, offline native CLI build',
  };
  if (receiptPath) {
    await mkdir(dirname(receiptPath), { recursive: true });
    await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  }
  console.log(`PASS real signed Site -> exact .crate App adoption: ${JSON.stringify(receipt)}`);
} finally {
  if (server) await new Promise((success) => server.close(success));
  if (process.env.LENSO_SITE_KEEP_TEMP !== '1') await rm(temporary, { recursive: true, force: true });
  else console.log(`Kept disposable test directory: ${temporary}`);
}

function input(name) {
  const value = process.env[name];
  if (!value || !isAbsolute(value)) throw new Error(`${name} must be an absolute path`);
  return value;
}

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function run(command, arguments_, cwd, env) {
  await new Promise((success, failure) => {
    const child = spawn(command, arguments_, { cwd, env, stdio: 'inherit' });
    child.once('error', failure);
    child.once('close', (code) => code === 0 ? success() : failure(new Error(`${command} exited ${code}`)));
  });
}
