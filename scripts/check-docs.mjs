import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const failures = [];

const requiredCurrentPages = [
  "index.mdx",
  "(start)/quickstart.mdx",
  "(start)/agent-skills.mdx",
  "(start)/project-and-plan.mdx",
  "(concepts)/architecture.mdx",
  "(concepts)/plugins-and-capabilities.mdx",
  "(concepts)/runtime-lifecycle.mdx",
  "(guides)/capability-authoring.mdx",
  "(guides)/plugin-composition.mdx",
  "(guides)/plugin-authoring.mdx",
  "(guides)/bun-plugin-authoring.mdx",
  "(guides)/web-capabilities.mdx",
  "(guides)/auth-plugin.mdx",
  "(guides)/secrets-plugin.mdx",
  "(guides)/postgres-kit.mdx",
  "(guides)/execution-adapters.mdx",
  "(guides)/web-and-observability.mdx",
  "(reference)/repository-map.mdx",
  "(reference)/status-and-scope.mdx",
  "(reference)/architecture-decisions.mdx",
];

function read(file) {
  const absolute = join(root, file);
  if (!existsSync(absolute)) {
    failures.push(`${file}: missing`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

for (const page of requiredCurrentPages) {
  read(`content/docs/${page}`);
  read(`content/docs/zh/${page}`);
}

const config = read("blume.config.ts");
for (const retiredMarker of ["versions:", "openapi:", 'path: "/api"']) {
  if (config.includes(retiredMarker)) {
    failures.push(`blume.config.ts: retired configuration ${JSON.stringify(retiredMarker)}`);
  }
}

const currentFiles = walkFiles(docsRoot).filter((file) => /\.(?:md|mdx|ts)$/.test(file));
const retiredGenerationName = new RegExp(["v", "next"].join(""), "i");
for (const file of currentFiles) {
  const text = readFileSync(file, "utf8");
  for (const [label, expression] of [
    ["retired public lifecycle", /Compose, Run locally, Connect, (?:and )?Status/g],
    ["retired runtime model", /agent-ready Rust modular applications and microservices/g],
    ["retired current API link", /href="\/docs\/(?:zh\/)?api"/g],
    ["retired hand-written Bun server", /implements the selected production JSON-RPC wire without importing Rust/g],
    ["retired missing Bun server SDK claim", /(?:stable high-level `@lenso\/bun`|尚未发布高层 `@lenso\/bun`)/g],
  ]) {
    if (expression.test(text)) failures.push(`${relative(root, file)}: ${label}`);
  }
  if (retiredGenerationName.test(text)) {
    failures.push(`${relative(root, file)}: retired generation terminology`);
  }
}

const invariantFiles = [
  "content/docs/index.mdx",
  "content/docs/(concepts)/architecture.mdx",
  "content/docs/(reference)/status-and-scope.mdx",
];
for (const marker of ["Resolved App Plan", "Runtime Driver", "Execution Adapter"]) {
  if (!invariantFiles.some((file) => read(file).includes(marker))) {
    failures.push(`current docs: missing canonical marker ${JSON.stringify(marker)}`);
  }
}

for (const [file, markers] of [
  ["content/docs/(guides)/web-capabilities.mdx", [
    "lenso-openapi",
    "There is deliberately no `enabled` field.",
    "Only that bound subset appears",
    '"document_path": "/openapi.json"',
  ]],
  ["content/docs/zh/(guides)/web-capabilities.mdx", [
    "lenso-openapi",
    "这里有意不提供 `enabled` 字段。",
    "只包含这个显式绑定的子集",
    '"document_path": "/openapi.json"',
  ]],
  ["content/docs/(guides)/bun-plugin-authoring.mdx", [
    "lenso plugin new example.echo --runtime bun",
    "lenso plugin dev --watch",
    "@lenso/bun",
  ]],
  ["content/docs/zh/(guides)/bun-plugin-authoring.mdx", [
    "lenso plugin new example.echo --runtime bun",
    "lenso plugin dev --watch",
    "@lenso/bun",
  ]],
]) {
  const text = read(file);
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${file}: missing current Bun marker ${JSON.stringify(marker)}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Documentation checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Documentation checks passed: ${requiredCurrentPages.length * 2} current pages.`);
