import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateCatalog } from './keyless-publisher/catalog.mjs';
import { digest, publisher, verifyArtifact } from './keyless-publisher/verify.mjs';
import { documentSlug } from './linked-documents.mjs';
import { validateLinkedRecords } from './linked-catalog.mjs';
import { validatePortableRecords } from './portable-catalog.mjs';
import { validatePackageRecords } from './package-catalog.mjs';
import { validateContentRecords } from './release-content.mjs';

export const currentUrl = 'https://marketplace.lenso.dev/api/marketplace/v3/current';
const maximum = 4 * 1024 * 1024;
const exact = (value, fields) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).sort().join(',') === fields.sort().join(',');
const stable = (value) => JSON.stringify(value, (_, child) => child && typeof child === 'object' && !Array.isArray(child)
  ? Object.fromEntries(Object.entries(child).sort(([a], [b]) => a.localeCompare(b))) : child);

export function validateCurrent(head) {
  assert.ok(exact(head, ['schema', 'catalog_id', 'revision', 'provenance', 'catalog', 'bundle']));
  assert.equal(head.schema, 'lenso.marketplace.keyless-current.v1');
  assert.equal(head.catalog_id, 'lenso-official-v2');
  assert.ok(Number.isSafeInteger(head.revision) && head.revision > 0);
  assert.ok(exact(head.provenance, ['repository', 'workflow', 'ref', 'source_sha']));
  for (const [key, value] of Object.entries(publisher)) assert.equal(head.provenance[key], value);
  assert.match(head.provenance.source_sha, /^[a-f0-9]{40}$/u);
  for (const object of [head.catalog, head.bundle]) {
    assert.ok(exact(object, ['path', 'sha256', 'size']));
    assert.match(object.sha256, /^[a-f0-9]{64}$/u);
    assert.equal(object.path, `/api/marketplace/v3/objects/${object.sha256}.json`);
    assert.ok(Number.isSafeInteger(object.size) && object.size > 0 && object.size <= maximum);
  }
  return head;
}

export async function fetchBounded(url, fetcher = fetch) {
  const response = await fetcher(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000) });
  assert.ok(response.ok && response.body, 'Keyless endpoint unavailable');
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    assert.ok(size <= maximum, 'Keyless response exceeds limit');
    chunks.push(chunk);
  }
  assert.ok(size > 0, 'Empty keyless response');
  return Buffer.concat(chunks);
}

export function validateKeylessCheckpoint(previous) {
  assert.ok(exact(previous, ['schema', 'catalog_id', 'revision', 'catalog_digest', 'records', 'statuses']));
  assert.equal(previous.schema, 'lenso.site.keyless-checkpoint.v1');
  assert.equal(previous.catalog_id, 'lenso-official-v2');
  assert.ok(Number.isSafeInteger(previous.revision) && previous.revision > 0);
  assert.match(previous.catalog_digest, /^[a-f0-9]{64}$/u);
  assert.ok(previous.statuses && typeof previous.statuses === 'object' && !Array.isArray(previous.statuses));
  assert.ok(exact(previous.records, Object.keys(previous.statuses)) && Object.keys(previous.records).length > 0
    && Object.keys(previous.records).length <= 10_000);
  for (const [id, oldDigest] of Object.entries(previous.records)) {
    assert.ok(id.length <= 512 && id.includes('@'));
    assert.match(oldDigest, /^[a-f0-9]{64}$/u);
    assert.ok(['listed', 'yanked', 'revoked'].includes(previous.statuses[id]));
  }
  return previous;
}

export function admitCatalog(bytes, head, previous = null, now = Math.floor(Date.now() / 1000)) {
  validateCurrent(head);
  assert.equal(bytes.length, head.catalog.size);
  assert.equal(digest(bytes), head.catalog.sha256);
  const catalog = validateCatalog(JSON.parse(bytes.toString('utf8')));
  for (const [channel, validate] of Object.entries({ linked_cargo: validateLinkedRecords, portable: validatePortableRecords,
    package: validatePackageRecords, release_content: validateContentRecords })) {
    validate(catalog.releases.filter((release) => release.channel === channel).map((release) => release.record));
  }
  assert.equal(catalog.revision, head.revision);
  assert.equal(catalog.catalog_id, head.catalog_id);
  assert.ok(catalog.issued_at <= now + 300, 'Catalog issue time is in the future');
  const records = Object.fromEntries(catalog.releases.map((release) => [
    `${release.plugin_id}@${release.version}`, digest(Buffer.from(stable(release))),
  ]));
  const statuses = Object.fromEntries(catalog.statuses.map((status) => [`${status.plugin_id}@${status.version}`, status.state]));
  if (previous) {
    validateKeylessCheckpoint(previous);
    assert.equal(previous.schema, 'lenso.site.keyless-checkpoint.v1');
    assert.ok(exact(previous, ['schema', 'catalog_id', 'revision', 'catalog_digest', 'records', 'statuses']), 'Invalid checkpoint fields');
    assert.equal(previous.catalog_id, head.catalog_id);
    assert.ok(Number.isSafeInteger(previous.revision) && previous.revision > 0);
    assert.match(previous.catalog_digest, /^[a-f0-9]{64}$/u);
    assert.ok(previous.records && previous.statuses && exact(previous.records, Object.keys(previous.statuses)));
    assert.ok(head.revision >= previous.revision, 'Keyless catalog rollback');
    if (head.revision === previous.revision) assert.equal(head.catalog.sha256, previous.catalog_digest, 'Keyless catalog equivocation');
    for (const [id, oldDigest] of Object.entries(previous.records)) {
      assert.match(oldDigest, /^[a-f0-9]{64}$/u);
      assert.ok(['listed', 'yanked', 'revoked'].includes(previous.statuses[id]));
      assert.equal(records[id], oldDigest, 'Immutable release changed or disappeared');
      if (previous.statuses[id] === 'revoked') assert.equal(statuses[id], 'revoked', 'Revocation is terminal');
    }
  }
  return { catalog, checkpoint: { schema: 'lenso.site.keyless-checkpoint.v1', catalog_id: head.catalog_id,
    revision: head.revision, catalog_digest: head.catalog.sha256, records, statuses } };
}

export async function fetchVerifiedCatalog(previous, fetcher = fetch) {
  const head = validateCurrent(JSON.parse((await fetchBounded(currentUrl, fetcher)).toString('utf8')));
  const [bytes, bundle] = await Promise.all([head.catalog, head.bundle].map(async (object) => {
    const raw = await fetchBounded(new URL(object.path, currentUrl), fetcher);
    assert.equal(raw.length, object.size);
    assert.equal(digest(raw), object.sha256);
    return raw;
  }));
  const scratch = await mkdtemp(join(tmpdir(), 'lenso-site-keyless-'));
  const artifact = join(scratch, 'catalog.json');
  const proof = join(scratch, 'bundle.jsonl');
  await Promise.all([writeFile(artifact, bytes, { mode: 0o600 }), writeFile(proof, bundle, { mode: 0o600 })]);
  await verifyArtifact(artifact, proof, head.provenance.source_sha, head.catalog.sha256);
  const admitted = admitCatalog(bytes, head, previous);
  const after = validateCurrent(JSON.parse((await fetchBounded(currentUrl, fetcher)).toString('utf8')));
  assert.equal(stable(after), stable(head), 'Current catalog changed during ingestion; rebuild');
  return { ...admitted, head };
}

export function normalizeCatalog(catalog, head) {
  const provenance = { kind: 'keyless', catalogId: head.catalog_id, revision: head.revision,
    catalogDigest: head.catalog.sha256, catalogSize: head.catalog.size,
    bundleDigest: head.bundle.sha256, bundleSize: head.bundle.size, sourceSha: head.provenance.source_sha };
  const empty = () => ({ catalogId: catalog.catalog_id, revision: catalog.revision, expiresAt: null, provenance, releases: [] });
  const output = { linked: empty(), portable: { ...empty(), detailsRevision: null, detailsExpiresAt: null }, package: empty(), content: empty() };
  const statuses = new Map(catalog.statuses.map((status) => [`${status.plugin_id}@${status.version}`, status.state]));
  for (const item of catalog.releases) {
    const r = item.record;
    const status = statuses.get(`${r.plugin_id}@${r.version}`);
    const channel = item.channel === 'linked_cargo' ? 'linked' : item.channel === 'release_content' ? 'content' : item.channel;
    const metadata = channel === 'content' ? r.metadata : r;
    const documentation = (metadata.documentation ?? []).map((d) => ({ ...d, slug: documentSlug(r.plugin_id, r.version, d, channel) }));
    const base = { pluginId: r.plugin_id, version: r.version, status, title: metadata.title, summary: metadata.summary,
      publisherId: metadata.publisher_id, sourceUrl: metadata.source_url, sourceRevision: metadata.source_revision,
      license: metadata.license, documentation };
    const release = channel === 'linked' ? { ...base, package: r.package, registryUrl: r.registry_url,
      integration: r.integration, targets: r.targets, crateDigest: r.crate_digest }
      : channel === 'portable' ? { ...base, artifactUrl: r.artifact.url, artifactDigest: r.artifact.digest,
        artifactSize: r.artifact.size, manifestDigest: r.artifact.manifest_digest }
      : channel === 'package' ? { ...base, distributions: r.distributions.map((d) => ({ ...d, registryUrl: d.registry_url, targets: d.targets ?? [] })) }
      : { pluginId: r.plugin_id, version: r.version, status, baseKind: r.base_kind, baseReleaseIdentity: r.base_release_identity,
        content: r.content.map((c) => ({ ...c })), metadata: base };
    output[channel].releases.push(release);
  }
  return output;
}
