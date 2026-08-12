import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const metadataPath = join(root, "openapi/app-api.source.json");
const outputs = [
  join(root, "openapi/app-api.v1.yaml"),
  join(root, "openapi/app-api.zh.v1.yaml"),
];
const contractPath = "contracts/openapi/app-api.v1.yaml";
const offlineCheckFlag = "--offline-metadata-only";

function digest(content) {
  return createHash("sha256").update(content).digest("hex");
}

function option(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  return value;
}

function sourceFromArguments({ discover = true } = {}) {
  const explicit = option("--source");
  if (explicit) return resolve(root, explicit);
  if (process.env.LENSO_FRAMEWORK_ROOT) {
    return join(resolve(process.env.LENSO_FRAMEWORK_ROOT), contractPath);
  }
  if (discover) {
    const siblingSource = resolve(root, "../lenso", contractPath);
    if (existsSync(siblingSource)) return siblingSource;
  }
  return undefined;
}

function frameworkRootFor(source) {
  const expectedSuffix = join("contracts", "openapi", "app-api.v1.yaml");
  if (!source.endsWith(expectedSuffix)) {
    throw new Error(`OpenAPI source must end with ${expectedSuffix}`);
  }
  return dirname(dirname(dirname(source)));
}

function sourceRevision(source, ref = "HEAD") {
  return execFileSync("git", ["-C", frameworkRootFor(source), "rev-parse", ref], {
    encoding: "utf8",
  }).trim();
}

function committedSource(source, revision) {
  return execFileSync("git", [
    "-C",
    frameworkRootFor(source),
    "show",
    `${revision}:${contractPath}`,
  ]);
}

function readMetadata() {
  if (!existsSync(metadataPath)) {
    throw new Error("openapi/app-api.source.json is missing; run pnpm openapi:sync -- --source <framework contract>");
  }
  return JSON.parse(readFileSync(metadataPath, "utf8"));
}

function validateContent(content) {
  for (const retired of ["console-bridge", "ConsoleBridge", "admin_data_list", "admin_action_invoke"]) {
    if (content.includes(retired)) {
      throw new Error(`authoritative OpenAPI still exposes retired operation ${JSON.stringify(retired)}`);
    }
  }
}

function check() {
  const metadata = readMetadata();
  if (metadata.repository !== "LioRael/lenso" || metadata.path !== contractPath) {
    throw new Error("OpenAPI source metadata must identify LioRael/lenso contracts/openapi/app-api.v1.yaml");
  }
  if (!/^[0-9a-f]{40}$/.test(metadata.revision ?? "")) {
    throw new Error("OpenAPI source metadata must pin a full framework commit revision");
  }
  if (!/^[0-9a-f]{64}$/.test(metadata.sha256 ?? "")) {
    throw new Error("OpenAPI source metadata must record a SHA-256 digest");
  }
  let canonical;
  for (const output of outputs) {
    if (!existsSync(output)) throw new Error(`${output} is missing`);
    const content = readFileSync(output);
    validateContent(content.toString("utf8"));
    if (!canonical) canonical = content;
    if (!content.equals(canonical)) throw new Error("English and Chinese API reference inputs have drifted");
    if (digest(content) !== metadata.sha256) {
      throw new Error(`${output} does not match the recorded framework source digest`);
    }
  }

  const offline = process.argv.includes(offlineCheckFlag);
  const sourceRef = option("--source-ref") ?? process.env.LENSO_FRAMEWORK_REF;
  if (offline && (option("--source") || process.env.LENSO_FRAMEWORK_ROOT || sourceRef)) {
    throw new Error(`${offlineCheckFlag} cannot be combined with a framework source or ref`);
  }
  const source = sourceFromArguments({ discover: !offline });
  if (!source) {
    if (!offline) {
      throw new Error(
        "authoritative framework source is unavailable; provide LENSO_FRAMEWORK_ROOT or --source, or place the framework at ../lenso",
      );
    }
    console.log(
      `OpenAPI inputs match pinned metadata for ${metadata.repository}@${metadata.revision} (${offlineCheckFlag}).`,
    );
    return;
  }
  if (!existsSync(source)) throw new Error(`OpenAPI source does not exist: ${source}`);
  frameworkRootFor(source);
  const detectedRevision = sourceRevision(source, sourceRef);
  if (detectedRevision !== metadata.revision) {
    throw new Error(
      `framework ${sourceRef ?? "HEAD"} ${detectedRevision} does not match recorded source revision ${metadata.revision}`,
    );
  }
  const sourceContent = readFileSync(source);
  const committedContent = committedSource(source, metadata.revision);
  if (!committedContent.equals(canonical)) {
    throw new Error(`${metadata.revision}:${metadata.path} does not match the site API reference inputs`);
  }
  if (!sourceRef && !sourceContent.equals(committedContent)) {
    throw new Error(`${source} has uncommitted changes relative to ${metadata.revision}`);
  }
  const checkedContent = sourceRef ? committedContent : sourceContent;
  if (digest(checkedContent) !== metadata.sha256) {
    throw new Error(`${source} has drifted from the committed site API reference inputs`);
  }
  console.log(`OpenAPI inputs match ${metadata.repository}@${metadata.revision}:${metadata.path}.`);
}

function sync() {
  if (process.argv.includes(offlineCheckFlag)) {
    throw new Error(`${offlineCheckFlag} is valid only with --check`);
  }
  const source = sourceFromArguments();
  if (!source) {
    throw new Error("provide --source <path> or LENSO_FRAMEWORK_ROOT when syncing OpenAPI");
  }
  if (!existsSync(source)) throw new Error(`OpenAPI source does not exist: ${source}`);
  const detectedRevision = sourceRevision(source);
  const revision = option("--revision");
  if (!/^[0-9a-f]{40}$/.test(revision ?? "")) {
    throw new Error("provide the authoritative full framework --revision when syncing OpenAPI");
  }
  if (revision !== detectedRevision) {
    throw new Error(`provided revision ${revision} does not match framework HEAD ${detectedRevision}`);
  }
  const content = readFileSync(source);
  if (!content.equals(committedSource(source, revision))) {
    throw new Error("OpenAPI source has uncommitted changes; commit the authoritative contract before syncing");
  }
  validateContent(content.toString("utf8"));
  for (const output of outputs) writeFileSync(output, content);

  const metadata = {
    repository: "LioRael/lenso",
    revision,
    path: contractPath,
    sha256: digest(content),
  };
  writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(`Synced API reference inputs from ${source}.`);
}

try {
  if (process.argv.includes("--check")) check();
  else sync();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
