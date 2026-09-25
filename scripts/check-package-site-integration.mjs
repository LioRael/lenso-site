import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { createServer } from 'node:https';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { documentSlug } from './linked-documents.mjs';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'lenso-package-site-'));
const keyPath = join(temporary, 'key.pem');
const certificatePath = join(temporary, 'certificate.pem');
const checkpointPath = join(temporary, 'checkpoint.json');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const keyId = 'fixture-key';
const catalogId = 'fixture-catalog';
const pluginId = 'example.bun';
const version = '1.0.0';
const body = Buffer.from('# Package quickstart\n\nThe npm package version is 2.1.0.\n');
const document = {
  id: 'quickstart', revision: 'v1', language: 'en', topic: 'Package quickstart',
  digest: `sha256:${createHash('sha256').update(body).digest('hex')}`,
  size: body.length, media_type: 'text/markdown',
};
let server;

function envelope(snapshot) {
  const payload = Buffer.from(JSON.stringify(snapshot));
  const signed = Buffer.concat([Buffer.from(`${snapshot.schema}\0${keyId}\0`), payload]);
  return Buffer.from(JSON.stringify({ key_id: keyId, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, signed, privateKey).toString('base64') }));
}

async function run(command, args, environment) {
  await new Promise((success, failure) => {
    const child = spawn(command, args, { cwd: root, env: environment, stdio: 'inherit' });
    child.once('error', failure);
    child.once('close', (code) => code === 0 ? success() : failure(new Error(`${command} exited ${code}`)));
  });
}

try {
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath,
    '-out', certificatePath, '-days', '1', '-subj', '/CN=127.0.0.1',
    '-addext', 'subjectAltName=IP:127.0.0.1',
    '-addext', 'basicConstraints=critical,CA:TRUE',
  ], { stdio: 'ignore' });
  const now = Math.floor(Date.now() / 1000);
  server = createServer({ key: await readFile(keyPath), cert: await readFile(certificatePath) }, (request, response) => {
    if (request.url === '/quickstart.md') {
      response.writeHead(200, { 'content-type': 'text/markdown', 'content-length': body.length }).end(body);
      return;
    }
    if (request.url === '/packages') {
      const port = server.address().port;
      const snapshot = {
        schema: 'lenso.marketplace.package-snapshot.v1', catalog_id: catalogId,
        revision: 1, issued_at: now - 1, expires_at: now + 3600,
        releases: [{
          plugin_id: pluginId, version, publisher_id: 'example', title: 'Example Bun',
          summary: 'Fixture npm-only Plugin', source_url: 'https://example.test/bun',
          source_revision: 'a'.repeat(40), license: 'MIT', availability: 'listed',
          distributions: [
            { id: 'bun', kind: 'npm_package', package: '@example/bun-plugin',
              version: '2.1.0', integrity: `sha256:${'b'.repeat(64)}`,
              registry_url: 'https://registry.npmjs.org', targets: ['workers'] },
            { id: 'native', kind: 'npm_package', package: '@example/bun-plugin',
              version: '2.1.0', integrity: `sha256:${'b'.repeat(64)}`,
              registry_url: 'https://registry.npmjs.org', targets: [] },
          ],
          documentation: [{ ...document, url: `https://127.0.0.1:${port}/quickstart.md` }],
        }],
      };
      const bytes = envelope(snapshot);
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': bytes.length }).end(bytes);
      return;
    }
    response.writeHead(404).end();
  });
  await new Promise((success, failure) => server.listen(0, '127.0.0.1', (error) => error ? failure(error) : success()));
  const port = server.address().port;
  const environment = { ...process.env,
    NODE_EXTRA_CA_CERTS: certificatePath,
    LENSO_MARKETPLACE_PACKAGE_URL: `https://127.0.0.1:${port}/packages`,
    LENSO_MARKETPLACE_CATALOG_ID: catalogId,
    LENSO_MARKETPLACE_KEY_ID: keyId,
    LENSO_MARKETPLACE_PUBLIC_KEY_HEX: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
    LENSO_MARKETPLACE_DOCUMENT_HOSTS: `127.0.0.1:${port}`,
    LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: checkpointPath,
  };
  for (const key of ['LENSO_MARKETPLACE_LINKED_CARGO_URL', 'LENSO_MARKETPLACE_PORTABLE_URL',
    'LENSO_MARKETPLACE_RELEASE_DETAILS_URL', 'LENSO_MARKETPLACE_RELEASE_CONTENT_URL',
    'LENSO_MARKETPLACE_CHECKPOINT_INPUT']) delete environment[key];
  await run('pnpm', ['build'], environment);
  const checkpoint = JSON.parse(await readFile(checkpointPath, 'utf8'));
  assert.equal(checkpoint.package.revision, 1);
  assert.equal(checkpoint.linked_cargo, null);
  assert.equal(checkpoint.portable, null);
  assert.ok(checkpoint.package.document_identities[JSON.stringify([pluginId, version, document.id, document.revision])]);
  const slug = documentSlug(pluginId, version, document, 'package');
  const catalog = JSON.parse(await readFile(join(root, 'out/api/plugins/catalog.json'), 'utf8'));
  const release = catalog.releases.find((item) => item.pluginId === pluginId && item.version === version);
  assert.equal(release.distributions[0].kind, 'npm_package');
  assert.equal(release.distributions[0].release.distributions[0].version, '2.1.0');
  assert.deepEqual(JSON.parse(await readFile(join(root, `out/api/plugins/releases/${pluginId}/${version}/release.json`), 'utf8')), release);
  const index = await readFile(join(root, 'out/plugins/index.html'), 'utf8');
  const page = await readFile(join(root, `out/plugins/${pluginId}/${version}/index.html`), 'utf8');
  const documentPage = await readFile(join(root, `out/plugins/${pluginId}/${version}/docs/${slug}/index.html`), 'utf8');
  const markdown = await readFile(join(root, `out/api/plugins/${pluginId}/${version}/docs/${slug}/content.md`), 'utf8');
  assert.match(index, /npm package only/);
  assert.match(page, /Plugin version/);
  assert.match(page, /npm package version/);
  assert.match(page, /2\.1\.0/);
  assert.match(page, /app add example\.bun@1\.0\.0[^<]*--distribution &#x27;native&#x27;/);
  assert.doesNotMatch(page, /--distribution &#x27;bun&#x27;/);
  assert.match(page, /No generic <code>lenso app add<\/code> command is available for this non-Native distribution/);
  assert.match(documentPage, /npm-only package/);
  assert.equal(markdown, body.toString());
  console.log('Signed npm-only fixture exposed an exact release and independently verified versioned Markdown without a Portable base.');
} finally {
  if (server) await new Promise((success) => server.close(success));
  await rm(temporary, { recursive: true, force: true });
}
