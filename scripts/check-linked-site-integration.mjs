import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:https';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { documentSlug } from './linked-documents.mjs';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'lenso-linked-site-'));
const keyPath = join(temporary, 'key.pem');
const certificatePath = join(temporary, 'certificate.pem');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const keyId = 'fixture-key';
const catalogId = 'fixture-catalog';
const pluginId = 'example.web';
const version = '1.0.0';
const body = Buffer.from('# Verified quickstart\n\nVersion 1.0.0 uses a linked Host build.\n');
const document = {
  id: 'quickstart', revision: 'rev-1', language: 'en', topic: 'Getting started',
  digest: `sha256:${createHash('sha256').update(body).digest('hex')}`,
  size: body.length, media_type: 'text/markdown',
};
let server;

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
      response.writeHead(200, { 'content-type': 'text/markdown', 'content-length': body.length });
      response.end(body);
      return;
    }
    if (request.url === '/linked-cargo') {
      const address = server.address();
      const url = `https://127.0.0.1:${address.port}/quickstart.md`;
      const snapshot = {
        schema: 'lenso.marketplace.linked-cargo-snapshot.v1', catalog_id: catalogId,
        revision: 1, issued_at: now - 1, expires_at: now + 3600,
        releases: [{
          plugin_id: pluginId, version, publisher_id: 'example', title: 'Example Web', summary: 'Fixture linked ingress',
          source_url: 'https://example.test/web', source_revision: 'a'.repeat(40), license: 'MIT',
          package: 'example-web', registry_url: 'https://crates.io', crate_digest: `sha256:${'b'.repeat(64)}`,
          integration: 'linked_plugin', targets: ['aarch64-apple-darwin'], availability: 'listed',
          documentation: [{ ...document, url }],
        }],
      };
      const payload = Buffer.from(JSON.stringify(snapshot));
      const signed = Buffer.concat([Buffer.from(`lenso.marketplace.linked-cargo-snapshot.v1\0${keyId}\0`), payload]);
      const envelope = Buffer.from(JSON.stringify({
        key_id: keyId, payload_base64: payload.toString('base64'),
        signature_base64: sign(null, signed, privateKey).toString('base64'),
      }));
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': envelope.length });
      response.end(envelope);
      return;
    }
    response.writeHead(404).end();
  });
  await new Promise((success, failure) => server.listen(0, '127.0.0.1', (error) => error ? failure(error) : success()));
  const port = server.address().port;
  const environment = {
    ...process.env,
    NODE_EXTRA_CA_CERTS: certificatePath,
    LENSO_MARKETPLACE_LINKED_CARGO_URL: `https://127.0.0.1:${port}/linked-cargo`,
    LENSO_MARKETPLACE_CATALOG_ID: catalogId,
    LENSO_MARKETPLACE_KEY_ID: keyId,
    LENSO_MARKETPLACE_PUBLIC_KEY_HEX: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
    LENSO_MARKETPLACE_DOCUMENT_HOSTS: `127.0.0.1:${port}`,
  };
  await run('pnpm', ['build'], environment);
  const slug = documentSlug(pluginId, version, document);
  const directory = await readFile(join(root, 'out/plugins/index.html'), 'utf8');
  const release = await readFile(join(root, `out/plugins/${pluginId}/${version}/index.html`), 'utf8');
  const page = await readFile(join(root, `out/plugins/${pluginId}/${version}/docs/${slug}/index.html`), 'utf8');
  const markdown = await readFile(join(root, `out/api/plugins/${pluginId}/${version}/docs/${slug}/content.md`), 'utf8');
  assert.match(directory, /Inspect exact signed version/);
  assert.match(release, /Fixture linked ingress/);
  assert.match(release, /lenso app add example.web@1.0.0/);
  assert.match(release, /Getting started/);
  assert.match(page, /Version 1.0.0 uses a linked Host build/);
  assert.equal(markdown, body.toString());
  await run('pnpm', ['check:published'], environment);
  console.log('Signed fixture proved Site directory → exact version → verified Markdown page and API.');
} finally {
  if (server) await new Promise((success) => server.close(success));
  await rm(temporary, { recursive: true, force: true });
}
