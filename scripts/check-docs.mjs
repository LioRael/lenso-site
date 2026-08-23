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
  "(start)/choose-a-path.mdx",
  "(start)/agent-skills.mdx",
  "(start)/project-and-plan.mdx",
  "(concepts)/architecture.mdx",
  "(concepts)/modules-and-capabilities.mdx",
  "(concepts)/runtime-lifecycle.mdx",
  "(guides)/capability-authoring.mdx",
  "(guides)/build-a-feature.mdx",
  "(guides)/module-composition.mdx",
  "(guides)/module-authoring.mdx",
  "(guides)/bun-module-authoring.mdx",
  "(guides)/web-capabilities.mdx",
  "(guides)/auth-module.mdx",
  "(guides)/secrets-module.mdx",
  "(guides)/postgres-kit.mdx",
  "(guides)/execution-adapters.mdx",
  "(guides)/web-and-observability.mdx",
  "(operate)/verification.mdx",
  "(operate)/troubleshooting.mdx",
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
for (const retiredMarker of ["versions:", 'path: "/api"']) {
  if (config.includes(retiredMarker)) {
    failures.push(`blume.config.ts: retired configuration ${JSON.stringify(retiredMarker)}`);
  }
}
if (/^  openapi:/mu.test(config)) {
  failures.push("blume.config.ts: retired top-level OpenAPI configuration");
}

for (const marker of [
  'output: "static"',
  'openInChat: ["claude", "chatgpt", "cursor"]',
  "agentReadability: true",
]) {
  if (!config.includes(marker)) {
    failures.push(`blume.config.ts: missing agent configuration ${JSON.stringify(marker)}`);
  }
}

for (const marker of ["webmcp:", "mcp:", 'route: "/mcp"']) {
  if (config.includes(marker)) {
    failures.push(`blume.config.ts: Lenso does not publish MCP configuration ${JSON.stringify(marker)}`);
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

const chinesePages = currentFiles.filter(
  (file) => file.endsWith(".mdx") && relative(docsRoot, file).startsWith("zh/"),
);
for (const file of chinesePages) {
  const text = readFileSync(file, "utf8");
  for (const expression of [/\]\(\/docs\/(?!zh(?:\/|\)))/gu, /href="\/docs\/(?!zh(?:\/|"))/gu]) {
    if (expression.test(text)) {
      failures.push(`${relative(root, file)}: internal link leaves the Chinese locale`);
    }
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
  ["content/docs/(start)/choose-a-path.mdx", ["Task map", "Use the source of truth"]],
  ["content/docs/(guides)/build-a-feature.mdx", ["tracer slice", "Prove removal"]],
  ["content/docs/(operate)/verification.mdx", ["Evidence ladder", "Delivery record"]],
  ["content/docs/(operate)/troubleshooting.mdx", ["Fast triage", "Domain Errors"]],
  ["content/docs/zh/(start)/choose-a-path.mdx", ["任务地图", "使用事实来源"]],
  ["content/docs/zh/(guides)/build-a-feature.mdx", ["tracer slice", "证明移除"]],
  ["content/docs/zh/(operate)/verification.mdx", ["证据阶梯", "交付记录"]],
  ["content/docs/zh/(operate)/troubleshooting.mdx", ["快速分类", "Domain Error"]],
]) {
  const text = read(file);
  for (const marker of markers) {
    if (!text.includes(marker)) failures.push(`${file}: missing task marker ${JSON.stringify(marker)}`);
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
  ["content/docs/(guides)/bun-module-authoring.mdx", [
    "lenso module create greeting --runtime bun",
    "lenso module dev --bun",
    "@lenso/bun-module",
  ]],
  ["content/docs/zh/(guides)/bun-module-authoring.mdx", [
    "lenso module create greeting --runtime bun",
    "lenso module dev --bun",
    "@lenso/bun-module",
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
