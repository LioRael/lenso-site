import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:https';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { create, load, search } from 'zbsearch';
import { documentSlug } from './linked-documents.mjs';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(tmpdir(), 'lenso-linked-site-'));
const keyPath = join(temporary, 'key.pem');
const certificatePath = join(temporary, 'certificate.pem');
const checkpointPath = join(temporary, 'checkpoint-candidate.json');
const secondCheckpointPath = join(temporary, 'checkpoint-second.json');
const failedCheckpointPath = join(temporary, 'checkpoint-failed.json');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const keyId = 'fixture-key';
const catalogId = 'fixture-catalog';
const pluginId = 'example.web';
const version = '1.0.0';
const portablePluginId = 'example.echo';
const portableVersion = '2.3.4';
const body = Buffer.from('# Verified quickstart\n\nVersion 1.0.0 uses a linked Host build.\n');
const revisedBody = Buffer.from('# Revised quickstart\n\nThe same release has an additive documentation revision.\n');
const portableBody = Buffer.from('# Portable quickstart\n\nPortable Bundle bytes are independently signed and versioned.\n');
const document = {
  id: 'quickstart', revision: 'rev-1', language: 'en', topic: 'Getting started',
  digest: `sha256:${createHash('sha256').update(body).digest('hex')}`,
  size: body.length, media_type: 'text/markdown',
};
const revisedDocument = {
  ...document, revision: 'rev-2', topic: 'Revised getting started',
  digest: `sha256:${createHash('sha256').update(revisedBody).digest('hex')}`,
  size: revisedBody.length,
};
const portableDocument = {
  id: 'quickstart', revision: 'rev-1', language: 'en', topic: 'Portable getting started',
  digest: `sha256:${createHash('sha256').update(portableBody).digest('hex')}`,
  size: portableBody.length, media_type: 'text/markdown',
};
const portableRelease = {
  plugin_id: portablePluginId, version: portableVersion, publisher_id: 'example',
  title: 'Example Echo', summary: 'Fixture Portable Plugin',
  presentation: { getting_started: 'UNVERSIONED_PUBLISHER_COPY_SENTINEL' },
  source_url: 'https://example.test/echo', source_revision: 'c'.repeat(40), license: 'MIT',
  artifact: {
    url: 'https://example.test/echo.bundle', digest: `sha256:${'d'.repeat(64)}`,
    size: 123, manifest_digest: `sha256:${'e'.repeat(64)}`,
  },
  availability: 'listed',
};
const sharedPortableRelease = {
  ...portableRelease, plugin_id: pluginId, version, title: 'Example Web Portable',
  summary: 'Independent signed Portable release',
  artifact: {
    ...portableRelease.artifact, url: 'https://example.test/web.bundle',
    digest: `sha256:${'1'.repeat(64)}`, manifest_digest: `sha256:${'2'.repeat(64)}`,
  },
};
const yankedPortableRelease = {
  ...portableRelease, plugin_id: 'example.retired', version: '0.9.0',
  title: 'YANKED_RELEASE_SENTINEL', availability: 'yanked',
};

function releaseDetails(release, url) {
  return {
    plugin_id: release.plugin_id, version: release.version,
    base_release_identity: `sha256:${createHash('sha256').update(JSON.stringify([
      release.publisher_id, release.source_url, release.source_revision,
      release.artifact.digest, release.artifact.size, release.artifact.manifest_digest,
    ])).digest('hex')}`,
    distributions: [{ id: 'portable', kind: 'portable_bundle', package: release.plugin_id,
      version: release.version, artifact: release.artifact }],
    documentation: [{ ...portableDocument, url }],
  };
}
let server;

function envelope(snapshot) {
  const payload = Buffer.from(JSON.stringify(snapshot));
  const signed = Buffer.concat([Buffer.from(`${snapshot.schema}\0${keyId}\0`), payload]);
  return Buffer.from(JSON.stringify({
    key_id: keyId, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, signed, privateKey).toString('base64'),
  }));
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
      response.writeHead(200, { 'content-type': 'text/markdown', 'content-length': body.length });
      response.end(body);
      return;
    }
    if (request.url === '/revised-quickstart.md') {
      response.writeHead(200, { 'content-type': 'text/markdown', 'content-length': revisedBody.length });
      response.end(revisedBody);
      return;
    }
    if (request.url === '/portable-quickstart.md') {
      response.writeHead(200, { 'content-type': 'text/markdown', 'content-length': portableBody.length });
      response.end(portableBody);
      return;
    }
    if (request.url === '/linked-cargo' || request.url === '/linked-cargo-amended') {
      const address = server.address();
      const url = `https://127.0.0.1:${address.port}/quickstart.md`;
      const amended = request.url === '/linked-cargo-amended';
      const snapshot = {
        schema: 'lenso.marketplace.linked-cargo-snapshot.v1', catalog_id: catalogId,
        revision: amended ? 2 : 1, issued_at: now - 1, expires_at: now + 3600,
        releases: [{
          plugin_id: pluginId, version, publisher_id: 'example', title: 'Example Web', summary: 'Fixture linked ingress',
          source_url: 'https://example.test/web', source_revision: 'a'.repeat(40), license: 'MIT',
          package: 'example-web', registry_url: 'https://crates.io', crate_digest: `sha256:${'b'.repeat(64)}`,
          integration: 'linked_plugin', targets: ['aarch64-apple-darwin'], availability: 'listed',
          documentation: [{ ...document, url }, ...(amended
            ? [{ ...revisedDocument, url: `https://127.0.0.1:${address.port}/revised-quickstart.md` }]
            : [])],
        }],
      };
      const bytes = envelope(snapshot);
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': bytes.length });
      response.end(bytes);
      return;
    }
    if (request.url === '/snapshot' || request.url === '/snapshot-rollback') {
      const snapshot = {
        schema: 'lenso.marketplace.snapshot.v1', catalog_id: catalogId,
        revision: request.url === '/snapshot-rollback' ? 1 : 2,
        issued_at: now - 1, expires_at: now + 3600,
        releases: [portableRelease, sharedPortableRelease, yankedPortableRelease],
      };
      const bytes = envelope(snapshot);
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': bytes.length });
      response.end(bytes);
      return;
    }
    if (request.url === '/release-details') {
      const address = server.address();
      const url = `https://127.0.0.1:${address.port}/portable-quickstart.md`;
      const snapshot = {
        schema: 'lenso.marketplace.release-details.v1', catalog_id: catalogId,
        revision: 3, issued_at: now - 1, expires_at: now + 3600,
        releases: [releaseDetails(portableRelease, url), releaseDetails(sharedPortableRelease, url),
          releaseDetails(yankedPortableRelease, url)],
      };
      const bytes = envelope(snapshot);
      response.writeHead(200, { 'content-type': 'application/json', 'content-length': bytes.length });
      response.end(bytes);
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
    LENSO_MARKETPLACE_PORTABLE_URL: `https://127.0.0.1:${port}/snapshot`,
    LENSO_MARKETPLACE_RELEASE_DETAILS_URL: `https://127.0.0.1:${port}/release-details`,
    LENSO_MARKETPLACE_CATALOG_ID: catalogId,
    LENSO_MARKETPLACE_KEY_ID: keyId,
    LENSO_MARKETPLACE_PUBLIC_KEY_HEX: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
    LENSO_MARKETPLACE_DOCUMENT_HOSTS: `127.0.0.1:${port}`,
    LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP: '1',
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: checkpointPath,
  };
  await run('pnpm', ['build'], environment);
  const firstCheckpoint = JSON.parse(await readFile(checkpointPath, 'utf8'));
  assert.equal(firstCheckpoint.schema, 'lenso.site.catalog-checkpoints.v1');
  assert.equal(firstCheckpoint.portable.revision, 2);
  assert.equal(firstCheckpoint.release_details.revision, 3);
  assert.equal(firstCheckpoint.linked_cargo.revision, 1);
  assert.ok(firstCheckpoint.portable.release_identities[`${portablePluginId}@${portableVersion}`]);
  assert.ok(firstCheckpoint.release_details.document_identities[`${pluginId}@${version}/quickstart@rev-1`]);
  assert.ok(firstCheckpoint.linked_cargo.document_identities[`${pluginId}@${version}/quickstart@rev-1`]);
  const slug = documentSlug(pluginId, version, document);
  const portableSlug = documentSlug(pluginId, version, portableDocument, 'portable');
  const echoPortableSlug = documentSlug(portablePluginId, portableVersion, portableDocument, 'portable');
  assert.notEqual(slug, portableSlug);
  const directory = await readFile(join(root, 'out/plugins/index.html'), 'utf8');
  const portableHtml = await readFile(join(root, `out/plugins/${portablePluginId}/${portableVersion}/index.html`), 'utf8');
  const release = await readFile(join(root, `out/plugins/${pluginId}/${version}/index.html`), 'utf8');
  const page = await readFile(join(root, `out/plugins/${pluginId}/${version}/docs/${slug}/index.html`), 'utf8');
  const markdown = await readFile(join(root, `out/api/plugins/${pluginId}/${version}/docs/${slug}/content.md`), 'utf8');
  const portablePage = await readFile(join(root, `out/plugins/${pluginId}/${version}/docs/${portableSlug}/index.html`), 'utf8');
  const portableMarkdown = await readFile(join(root, `out/api/plugins/${pluginId}/${version}/docs/${portableSlug}/content.md`), 'utf8');
  const searchIndex = JSON.parse(await readFile(join(root, 'out/api/plugins/search'), 'utf8'));
  const searchDatabase = create({ schema: { _: 'string' } });
  load(searchDatabase, searchIndex);
  const linkedSearch = await search(searchDatabase, { term: 'Host build' });
  const portableSearch = await search(searchDatabase, { term: 'independently signed' });
  assert.ok(linkedSearch.hits.some((hit) => hit.document.url === `/plugins/${pluginId}/${version}/docs/${slug}`));
  assert.ok(portableSearch.hits.some((hit) => hit.document.url === `/plugins/${pluginId}/${version}/docs/${portableSlug}`));
  assert.ok(portableSearch.hits.some((hit) => hit.document.url === `/plugins/${portablePluginId}/${portableVersion}/docs/${echoPortableSlug}`));
  assert.doesNotMatch(JSON.stringify(searchIndex), /YANKED_RELEASE_SENTINEL|example\.retired/);
  assert.doesNotMatch(JSON.stringify(searchIndex), /lenso\.web-ingress|UNVERSIONED_PUBLISHER_COPY_SENTINEL/);
  assert.match(directory, /Inspect exact signed version/);
  assert.match(directory, /example.echo/);
  assert.match(directory, /2\.3\.4/);
  assert.match(directory, /Fixture Portable Plugin/);
  assert.match(directory, /Portable Bundle/);
  assert.match(directory, /sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd/);
  assert.match(directory, /\/plugins\/example\.echo\/2\.3\.4/);
  assert.match(portableHtml, /Fixture Portable Plugin/);
  assert.match(portableHtml, /sha256:dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd/);
  assert.match(portableHtml, /Portable getting started/);
  assert.match(portableHtml, new RegExp(echoPortableSlug));
  assert.doesNotMatch(portableHtml, /UNVERSIONED_PUBLISHER_COPY_SENTINEL|Candidate documentation|No implicit portable fallback/);
  await assert.rejects(readFile(join(root, `out/plugins/${portablePluginId}/9.9.9/index.html`)));
  assert.match(release, /Fixture linked ingress/);
  assert.match(release, /Independent signed Portable release/);
  assert.match(release, /two independently signed channels/);
  assert.match(release, /sha256:1111111111111111111111111111111111111111111111111111111111111111/);
  assert.match(release, /lenso app add example.web@1.0.0/);
  assert.match(release, /Getting started/);
  assert.match(release, /Portable getting started/);
  assert.match(release, new RegExp(portableSlug));
  assert.match(page, /Version 1.0.0 uses a linked Host build/);
  assert.equal((page.match(/<h1\b/g) ?? []).length, 1, 'publisher Markdown must not introduce another H1');
  assert.match(page, /<h2[^>]*>Verified quickstart<\/h2>/);
  assert.equal(markdown, body.toString());
  assert.match(portablePage, /linked-doc-eyebrow[^>]*>Verified.*Portable.*versioned Markdown/);
  assert.match(portablePage, /Portable Bundle bytes are independently signed and versioned/);
  assert.doesNotMatch(portablePage, /Version 1\.0\.0 uses a linked Host build/);
  assert.equal(portableMarkdown, portableBody.toString());
  assert.notEqual(portableMarkdown, markdown);
  const secondEnvironment = { ...environment,
    LENSO_MARKETPLACE_CHECKPOINT_INPUT: checkpointPath,
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: secondCheckpointPath,
    LENSO_MARKETPLACE_LINKED_CARGO_URL: `https://127.0.0.1:${port}/linked-cargo-amended` };
  delete secondEnvironment.LENSO_MARKETPLACE_CHECKPOINT_BOOTSTRAP;
  await run('pnpm', ['build'], secondEnvironment);
  const secondCheckpoint = JSON.parse(await readFile(secondCheckpointPath, 'utf8'));
  assert.equal(secondCheckpoint.linked_cargo.revision, 2);
  assert.equal(secondCheckpoint.linked_cargo.document_identities[`${pluginId}@${version}/quickstart@rev-1`],
    firstCheckpoint.linked_cargo.document_identities[`${pluginId}@${version}/quickstart@rev-1`]);
  assert.ok(secondCheckpoint.linked_cargo.document_identities[`${pluginId}@${version}/quickstart@rev-2`]);
  const revisedSlug = documentSlug(pluginId, version, revisedDocument);
  assert.equal(await readFile(join(root, `out/api/plugins/${pluginId}/${version}/docs/${slug}/content.md`), 'utf8'), body.toString());
  assert.equal(await readFile(join(root, `out/api/plugins/${pluginId}/${version}/docs/${revisedSlug}/content.md`), 'utf8'), revisedBody.toString());
  assert.match(await readFile(join(root, `out/plugins/${pluginId}/${version}/index.html`), 'utf8'), /Revised getting started/);
  const metadataOnlyEnvironment = { ...environment };
  delete metadataOnlyEnvironment.LENSO_MARKETPLACE_RELEASE_DETAILS_URL;
  await run('node', ['scripts/ingest-linked-catalog.mjs'], metadataOnlyEnvironment);
  const metadataOnly = JSON.parse(await readFile(join(root, 'lib/.generated/portable-catalog.json'), 'utf8'));
  const metadataOnlyDocuments = JSON.parse(await readFile(join(root, 'lib/.generated/linked-documents.json'), 'utf8'));
  assert.equal(metadataOnly.detailsRevision, null);
  assert.ok(metadataOnly.releases.every((release) => release.documentation.length === 0));
  assert.ok(Object.values(metadataOnlyDocuments).every((item) => item.channel === 'linked'));
  await run('node', ['scripts/ingest-linked-catalog.mjs'], environment);
  const rollbackEnvironment = { ...secondEnvironment,
    LENSO_MARKETPLACE_CHECKPOINT_INPUT: secondCheckpointPath,
    LENSO_MARKETPLACE_CHECKPOINT_OUTPUT: failedCheckpointPath,
    LENSO_MARKETPLACE_PORTABLE_URL: `https://127.0.0.1:${port}/snapshot-rollback` };
  await assert.rejects(run('pnpm', ['build'], rollbackEnvironment));
  await assert.rejects(readFile(failedCheckpointPath), { code: 'ENOENT' });
  console.log('Signed HTTPS fixtures proved exact Portable details/base join, additive linked documentation revisions, checkpoint bootstrap/continuation, and no output on rollback failure.');
} finally {
  if (server) await new Promise((success) => server.close(success));
  await rm(temporary, { recursive: true, force: true });
}
