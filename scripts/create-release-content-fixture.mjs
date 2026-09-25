import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { verifyLinkedCatalog } from './linked-catalog.mjs';
import { joinReleaseContent, verifyReleaseContent } from './release-content.mjs';

const basePath = process.env.LENSO_SITE_LINKED_SNAPSHOT;
const parent = process.env.LENSO_SITE_CONTENT_FIXTURE_PARENT;
if (!basePath || !parent || !isAbsolute(basePath) || !isAbsolute(parent)) {
  throw new Error('LENSO_SITE_LINKED_SNAPSHOT and LENSO_SITE_CONTENT_FIXTURE_PARENT must be absolute paths');
}
const source = JSON.parse(await readFile(basePath, 'utf8'));
const base = JSON.parse(Buffer.from(source.payload_base64, 'base64').toString('utf8'));
assert.equal(base.schema, 'lenso.marketplace.linked-cargo-snapshot.v1');
const auth = base.releases.find((release) => release.plugin_id === 'lenso.auth.api-token' && release.version === '0.1.1');
assert.ok(auth, 'exact Auth 0.1.1 linked release is required');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const trust = {
  catalog_id: base.catalog_id, key_id: 'site-content-fixture',
  public_key_hex: publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('hex'),
};
const verifierTrust = { catalogId: trust.catalog_id, keyId: trust.key_id, publicKeyHex: trust.public_key_hex };
const now = Math.floor(Date.now() / 1000);
const directory = await mkdtemp(join(parent, 'signed-content-'));
const templateSource = join(directory, 'template-source');
const extensionSource = join(directory, 'extension-source');
await mkdir(join(templateSource, 'src'), { recursive: true });
await mkdir(extensionSource);
await writeFile(join(templateSource, 'README.md'), 'Editable Auth frontend template. Review before use.\n');
await writeFile(join(templateSource, 'src/App.tsx'), "export const App = () => 'Auth template';\n");
await writeFile(join(extensionSource, 'package.json'), `${JSON.stringify({
  name: 'lenso-auth-api-token-dev-extension', version: '0.1.1', type: 'module',
  lenso: { pluginId: 'lenso.auth.api-token', runtime: 'bun', rootSlot: 'tools', source: 'index.ts',
    conventions: [{ id: 'lenso.auth.api-token.compiler', entries: ['page.tsx'],
      compiler: { program: 'bun', args: ['compiler.mjs'] } }] },
})}\n`);
await writeFile(join(extensionSource, 'index.ts'), 'export {};\n');
await writeFile(join(extensionSource, 'compiler.mjs'), "throw new Error('This extension is not selected by copying it.');\n");

function archive(sourceDirectory, name, files) {
  const path = join(directory, name);
  execFileSync('tar', ['--format', 'ustar', '-czf', path, '-C', sourceDirectory, ...files], {
    env: { ...process.env, COPYFILE_DISABLE: '1' },
  });
  const entries = execFileSync('tar', ['-tzf', path], { encoding: 'utf8' }).trim().split('\n').sort();
  assert.deepEqual(entries, [...files].sort());
  return path;
}
const templatePath = archive(templateSource, 'frontend-template.tar.gz', ['README.md', 'src/App.tsx']);
const extensionPath = archive(extensionSource, 'dev-extension.tar.gz', ['package.json', 'index.ts', 'compiler.mjs']);

function signedEnvelope(schema, snapshot) {
  const payload = Buffer.from(JSON.stringify(snapshot));
  const message = Buffer.concat([Buffer.from(`${schema}\0${trust.key_id}\0`), payload]);
  return Buffer.from(JSON.stringify({
    key_id: trust.key_id, payload_base64: payload.toString('base64'),
    signature_base64: sign(null, message, privateKey).toString('base64'),
  }));
}
const linked = { ...base, issued_at: now - 1, expires_at: now + 3600 };
const linkedBytes = signedEnvelope(linked.schema, linked);
const verifiedLinked = verifyLinkedCatalog(linkedBytes, verifierTrust, now);
const identity = verifiedLinked.baseReleases.find((release) =>
  release.pluginId === auth.plugin_id && release.version === auth.version)?.identity;
assert.ok(identity);
const templateBytes = await readFile(templatePath);
const extensionBytes = await readFile(extensionPath);
const content = {
  schema: 'lenso.marketplace.release-content.v2', catalog_id: base.catalog_id,
  revision: 1, issued_at: now - 1, expires_at: now + 3600,
  releases: [{
    plugin_id: auth.plugin_id, version: auth.version,
    base_kind: 'linked_cargo', base_release_identity: identity,
    content: [
      { id: 'frontend-template', kind: 'editable_template',
        url: 'https://example.test/frontend-template.tar.gz', digest: digest(templateBytes), size: templateBytes.length },
      { id: 'dev-extension', kind: 'development_extension',
        url: 'https://example.test/dev-extension.tar.gz', digest: digest(extensionBytes), size: extensionBytes.length },
    ],
  }],
};
const contentBytes = signedEnvelope(content.schema, content);
const verifiedContent = verifyReleaseContent(contentBytes, verifierTrust, now);
assert.equal(joinReleaseContent(verifiedLinked, { catalogId: null, releases: [] }, verifiedContent).releases.length, 1);
const linkedPath = join(directory, 'linked-snapshot.json');
const contentPath = join(directory, 'release-content.json');
const trustPath = join(directory, 'trust.json');
await writeFile(linkedPath, linkedBytes, { flag: 'wx' });
await writeFile(contentPath, contentBytes, { flag: 'wx' });
await writeFile(trustPath, `${JSON.stringify(trust)}\n`, { flag: 'wx' });
const manifest = {
  directory, linked_snapshot: linkedPath, release_content: contentPath,
  trust: trustPath, template_archive: templatePath, extension_archive: extensionPath,
  base_release_identity: identity,
  linked_snapshot_sha256: digest(linkedBytes), release_content_sha256: digest(contentBytes),
  template_sha256: digest(templateBytes), extension_sha256: digest(extensionBytes),
  expires_at: content.expires_at,
};
await writeFile(join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify(manifest));

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}
