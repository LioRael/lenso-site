import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = process.env.LENSO_CLI_BIN;
if (!cli || !isAbsolute(cli)) {
  console.error("Set LENSO_CLI_BIN to the absolute path of a source-built lenso CLI.");
  process.exit(2);
}

const directory = mkdtempSync(join(tmpdir(), "lenso-engine-extension-"));
try {
  cpSync(join(root, "examples/engine-extension"), directory, { recursive: true });
  const run = (...args) => execFileSync(cli, ["engine", ...args], {
    cwd: directory,
    encoding: "utf8",
    timeout: 90_000,
  });
  const lock = JSON.parse(run("lock", "--workflow", "engine.json"));
  assert.equal(lock.plugins, 1);

  const plan = JSON.parse(run("inspect", "--workflow", "engine.json"));
  assert.equal(plan.steps.length, 1);
  assert.equal(plan.steps[0].step.id, "example.summary.v1/intro.md");

  const generation = JSON.parse(run("run", "--workflow", "engine.json", "--output", "dist"));
  assert.equal(generation.outputs["example.summary.v1/intro.md"].summary.value.title, "First document");
  assert.equal(generation.outputs["example.summary.v1/intro.md"].summary.schema, "example.summary.v1");
  assert.ok(readFileSync(join(directory, "dist/current.json"), "utf8").includes("schema"));

  const processor = join(directory, "tools/summary/summary.mjs");
  writeFileSync(processor, `${readFileSync(processor, "utf8")}\n// Modified after locking.\n`);
  const rejected = spawnSync(cli, ["engine", "run", "--workflow", "engine.json"], {
    cwd: directory,
    encoding: "utf8",
    timeout: 90_000,
  });
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /locked input changed/);
  console.log("Engine extension smoke passed: lock, inspect, run, published output, and tamper rejection.");
} finally {
  rmSync(directory, { recursive: true });
}
