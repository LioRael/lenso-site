import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { createServer } from 'node:https';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { verifyPackageCatalog } from './package-catalog.mjs';
import { joinReleaseContent, verifyReleaseContent } from './release-content.mjs';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'lenso-site-d16-'));
const certificate = join(temporary, 'certificate.pem');
const key = join(temporary, 'key.pem');
const checkpoint = join(temporary, 'checkpoint.json');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalogId: 'd16-test', keyId: 'd16-test-key',
  publicKeyHex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const packageSchema = 'lenso.marketplace.package-snapshot.v1';
const contentSchema = 'lenso.marketplace.release-content.v2';
const packageDoc = Buffer.from('# Package start\n');
const sourceDoc = Buffer.from('# Source start\n');
let packageBytes;
let contentBytes;
let server;

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function envelope(schema, releases) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    schema, catalog_id: trust.catalogId, revision: 1,
    issued_at: now - 1, expires_at: now + 3600, releases,
  }));
  return Buffer.from(JSON.stringify({
    key_id: trust.keyId, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, Buffer.concat([
      Buffer.from(`${schema}\0${trust.keyId}\0`), payload,
    ]), privateKey).toString('base64'),
  }));
}

function document(url, bytes) {
  return {
    id: 'start', revision: 'r1', language: 'en', topic: 'getting-started',
    url, digest: digest(bytes), size: bytes.length, media_type: 'text/markdown',
  };
}

async function run() {
  const openssl = spawnSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key,
    '-out', certificate, '-days', '1', '-subj', '/CN=127.0.0.1',
    '-addext', 'subjectAltName=IP:127.0.0.1',
    '-addext', 'basicConstraints=critical,CA:TRUE',
  ], { stdio: 'ignore' });
  if (openssl.status !== 0) throw new Error('openssl could not create a local fixture certificate');
  server = createServer({ key: await readFile(key), cert: await readFile(certificate) },
    (request, response) => {
      const bytes = request.url === '/package' ? packageBytes
        : request.url === '/content' ? contentBytes
          : request.url === '/package-start.md' ? packageDoc
            : request.url === '/source-start.md' ? sourceDoc : null;
      if (!bytes) { response.writeHead(404).end(); return; }
      response.writeHead(200, { 'content-type': request.url.endsWith('.md') ? 'text/markdown' : 'application/json',
        'content-length': bytes.length });
      response.end(bytes);
    });
  await new Promise((success, failure) => server.listen(0, '127.0.0.1', (error) =>
    error ? failure(error) : success()));
  const host = `127.0.0.1:${server.address().port}`;
  const url = (path) => `https://${host}${path}`;
  const packageRelease = {
    plugin_id: 'example.editor', version: '1.0.0', publisher_id: 'example',
    title: 'Editor package', summary: 'Signed npm-only package fixture',
    source_url: 'https://example.test/editor', source_revision: 'a'.repeat(40),
    license: 'MIT', distributions: [{
      id: 'npm', kind: 'npm_package', package: '@example/editor', version: '1.0.0',
      integrity: digest(Buffer.from('npm tarball fixture')), registry_url: 'https://registry.npmjs.org',
    }], availability: 'listed', documentation: [document(url('/package-start.md'), packageDoc)],
  };
  packageBytes = envelope(packageSchema, [packageRelease]);
  const packages = verifyPackageCatalog(packageBytes, trust);
  const sourceMetadata = {
    publisher_id: 'example', title: 'Editor source', summary: 'Editable source fixture',
    source_url: 'https://example.test/editor-source', source_revision: 'b'.repeat(40),
    license: 'MIT', documentation: [document(url('/source-start.md'), sourceDoc)],
  };
  const starterBytes = Buffer.from('starter archive fixture');
  const extensionBytes = Buffer.from('extension archive fixture');
  const sourceContent = [
    { id: 'starter', kind: 'editable_template', url: 'https://example.test/starter.tar.gz',
      digest: digest(starterBytes), size: starterBytes.length },
    { id: 'dev-extension', kind: 'development_extension', url: 'https://example.test/dev-extension.tar.gz',
      digest: digest(extensionBytes), size: extensionBytes.length },
  ];
  const sourceIdentity = digest(Buffer.from(JSON.stringify([
    'example.editor.source', '1.0.0',
    [
      sourceMetadata.publisher_id, sourceMetadata.title, sourceMetadata.summary,
      sourceMetadata.source_url, sourceMetadata.source_revision, sourceMetadata.license,
      sourceMetadata.documentation.map((item) => [
        item.id, item.revision, item.language, item.topic, null, item.url,
        item.digest, item.size, item.media_type,
      ]),
    ],
    sourceContent.map((item) => [item.id, item.kind, item.url, item.digest, item.size]),
  ])));
  const attached = {
    plugin_id: packageRelease.plugin_id, version: packageRelease.version,
    base_kind: 'package', base_release_identity: packages.baseReleases[0].identity,
    content: [sourceContent[0]],
  };
  const standalone = {
    plugin_id: 'example.editor.source', version: '1.0.0',
    base_kind: 'content_only', base_release_identity: sourceIdentity,
    metadata: sourceMetadata, content: sourceContent,
  };
  contentBytes = envelope(contentSchema, [attached, standalone]);
  const content = verifyReleaseContent(contentBytes, trust);
  const empty = { catalogId: null, releases: [] };
  const joined = joinReleaseContent(empty, empty, content, packages);
  assert.deepEqual(joined.releases.map((item) => item.baseKind), ['package', 'content_only']);
  assert.throws(() => joinReleaseContent(empty, empty, content, { ...packages,
    baseReleases: [{ ...packages.baseReleases[0], identity: digest(Buffer.from('changed')) }],
  }), /immutable package base/);
  assert.throws(() => joinReleaseContent(empty, empty, content, { ...packages,
    baseReleases: [...packages.baseReleases, {
      pluginId: standalone.plugin_id, version: standalone.version, identity: digest(Buffer.from('collision')),
    }],
  }), /collides with a published base release/);

  const environment = {
    ...process.env,
    NODE_EXTRA_CA_CERTS: certificate,
    LENSO_MARKETPLACE_PACKAGE_URL: url('/package'),
    LENSO_MARKETPLACE_RELEASE_CONTENT_URL: url('/content'),
    LENSO_MARKETPLACE_CATALOG_ID: trust.catalogId,
    LENSO_MARKETPLACE_KEY_ID: trust.keyId,
    LENSO_MARKETPLACE_PUBLIC_KEY_HEX: trust.publicKeyHex,
    LENSO_MARKETPLACE_DOCUMENT_HOSTS: host,
    LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: checkpoint,
  };
  for (const name of [
    'LENSO_MARKETPLACE_LINKED_CARGO_URL', 'LENSO_MARKETPLACE_PORTABLE_URL',
    'LENSO_MARKETPLACE_RELEASE_DETAILS_URL', 'LENSO_MARKETPLACE_CHECKPOINT_INPUT',
  ]) delete environment[name];
  const buildExit = await new Promise((success, failure) => {
    const build = spawn('pnpm', ['build'], { cwd: root, env: environment, stdio: 'inherit' });
    build.once('error', failure);
    build.once('close', success);
  });
  if (buildExit !== 0) throw new Error(`Site build failed: ${buildExit}`);

  const readOutput = async (path) => readFile(join(root, 'out', path), 'utf8');
  const listing = await readOutput('plugins/index.html');
  const packagePage = await readOutput('plugins/example.editor/1.0.0/index.html');
  const sourcePage = await readOutput('plugins/example.editor.source/1.0.0/index.html');
  const directory = JSON.parse(await readOutput('api/plugins/catalog.json'));
  const savedCheckpoint = JSON.parse(await readFile(checkpoint, 'utf8'));
  assert.equal(directory.releases.length, 2);
  assert.ok(directory.releases.some((item) => item.pluginId === packageRelease.plugin_id
    && item.distributions.some((entry) => entry.kind === 'npm_package')));
  assert.ok(directory.releases.some((item) => item.pluginId === standalone.plugin_id
    && item.distributions.length === 0 && item.optionalSourceContent[0].release.metadata.title === sourceMetadata.title));
  assert.ok(listing.includes('/plugins/example.editor/1.0.0'));
  assert.ok(listing.includes('/plugins/example.editor.source/1.0.0'));
  assert.ok(packagePage.includes('--package-snapshot') && packagePage.includes(packageRelease.distributions[0].integrity));
  assert.ok(sourcePage.includes(sourceMetadata.title) && sourcePage.includes(sourceIdentity));
  assert.ok(sourcePage.includes('--content-preview') && !sourcePage.includes('--linked-snapshot'));
  assert.equal(savedCheckpoint.package.revision, 1);
  assert.equal(savedCheckpoint.release_content.revision, 1);
  for (const release of joined.releases.filter((item) => item.baseKind === 'content_only')) {
    for (const signedDocument of release.metadata.documentation) {
      const markdown = await readOutput(`api/plugins/${release.pluginId}/${release.version}/docs/${signedDocument.slug}/content.md`);
      assert.equal(markdown, sourceDoc.toString());
    }
  }
  for (const signedDocument of packages.releases[0].documentation) {
    const markdown = await readOutput(`api/plugins/${packageRelease.plugin_id}/${packageRelease.version}/docs/${signedDocument.slug}/content.md`);
    assert.equal(markdown, packageDoc.toString());
  }
  console.log(JSON.stringify({
    status: 'PASS', packageIdentity: packages.baseReleases[0].identity,
    sourceIdentity, catalogReleases: directory.releases.length,
    packagePath: '/plugins/example.editor/1.0.0',
    sourcePath: '/plugins/example.editor.source/1.0.0',
    markdownBodies: 2, checkpointChannels: ['package', 'release_content'],
  }));
}

try {
  await run();
} finally {
  if (server) await new Promise((success) => server.close(success));
  await rm(temporary, { recursive: true, force: true });
}
