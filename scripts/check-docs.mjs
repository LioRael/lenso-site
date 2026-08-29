import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const failures = [];

const requiredCurrentPages = [
  "index.mdx",
  "(start)/agent-skills.mdx",
  "(start)/quickstart.mdx",
  "(agent)/agent-development.mdx",
  "(agent)/first-app.mdx",
  "(agent)/agent-configuration.mdx",
  "(web)/web-backend.mdx",
  "(web)/web-endpoint-plugin.mdx",
  "(web)/web-host-integration.mdx",
  "(web)/web-testing.mdx",
  "(web)/web-capabilities.mdx",
  "(web)/auth-plugin.mdx",
  "(concepts)/architecture.mdx",
  "(concepts)/project-and-plan.mdx",
  "(concepts)/runtime-lifecycle.mdx",
  "(plugins)/plugins-and-capabilities.mdx",
  "(plugins)/choose-plugin-path.mdx",
  "(plugins)/plugin-authoring.mdx",
  "(plugins)/linked-rust-plugin.mdx",
  "(plugins)/bun-plugin-authoring.mdx",
  "(plugins)/plugin-configuration.mdx",
  "(plugins)/plugin-composition.mdx",
  "(guides)/capability-authoring.mdx",
  "(guides)/secrets-plugin.mdx",
  "(operations)/postgres-kit.mdx",
  "(operations)/execution-adapters.mdx",
  "(operations)/web-and-observability.mdx",
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

function requireOrderedMarkers(file, markers) {
  const text = read(file);
  let cursor = 0;
  for (const marker of markers) {
    const index = text.indexOf(marker, cursor);
    if (index === -1) {
      failures.push(`${file}: missing ordered marker ${JSON.stringify(marker)}`);
      return;
    }
    cursor = index + marker.length;
  }
}

function requireCount(file, marker, expected) {
  const text = read(file);
  const actual = text.split(marker).length - 1;
  if (actual !== expected) {
    failures.push(
      `${file}: expected ${expected} occurrence(s) of ${JSON.stringify(marker)}, found ${actual}`,
    );
  }
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
const documentPaths = currentFiles
  .filter((file) => /\.mdx$/.test(file))
  .map((file) => relative(docsRoot, file));
const englishDocuments = new Set(
  documentPaths.filter((file) => !file.startsWith("zh/")),
);
const chineseDocuments = new Set(
  documentPaths.filter((file) => file.startsWith("zh/")).map((file) => file.slice(3)),
);
for (const file of englishDocuments) {
  if (!chineseDocuments.has(file)) {
    failures.push(`content/docs/zh/${file}: missing translation peer`);
  }
}
for (const file of chineseDocuments) {
  if (!englishDocuments.has(file)) {
    failures.push(`content/docs/${file}: missing translation peer`);
  }
}

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
  ["content/docs/(start)/agent-skills.mdx", [
    "lenso-app-configuration",
    "Start with a bounded request",
    "Require source inspection before implementation",
    "Build a Web backend",
    "Control how far the agent may deliver",
    "Recover when the agent goes in the wrong direction",
  ]],
  ["content/docs/zh/(start)/agent-skills.mdx", [
    "lenso-app-configuration",
    "从一个有边界的请求开始",
    "实现前必须检查源码",
    "构建 Web 后端",
    "控制 Agent 可以交付到哪里",
    "Agent 方向错误时如何纠正",
  ]],
  ["content/docs/(web)/web-backend.mdx", [
    "POST /greetings",
    "Current authoring boundary",
    "Write the Endpoint Plugin",
    "Connect the Host and Ingress",
    "Prove the HTTP backend",
    "Definition of done",
  ]],
  ["content/docs/zh/(web)/web-backend.mdx", [
    "POST /greetings",
    "当前 Authoring 边界",
    "编写 Endpoint Plugin",
    "连接 Host 与 Ingress",
    "证明 HTTP 后端",
    "完成条件",
  ]],
  ["content/docs/(web)/web-endpoint-plugin.mdx", [
    "#[endpoint]",
    "EndpointProvider",
    "endpoint_attributes",
    "Connect the Host and Ingress",
  ]],
  ["content/docs/zh/(web)/web-endpoint-plugin.mdx", [
    "#[endpoint]",
    "EndpointProvider",
    "endpoint_attributes",
    "连接 Host 与 Ingress",
  ]],
  ["content/docs/(web)/web-host-integration.mdx", [
    "NativeModuleFactory",
    "plugins/lenso.web-ingress/web.toml",
    "many lenso.http.endpoint@1",
    "Prove the HTTP backend",
  ]],
  ["content/docs/zh/(web)/web-host-integration.mdx", [
    "NativeModuleFactory",
    "plugins/lenso.web-ingress/web.toml",
    "many lenso.http.endpoint@1",
    "证明 HTTP 后端",
  ]],
  ["content/docs/(web)/web-testing.mdx", [
    "sdk_authored_endpoint_routes_through_the_real_ingress",
    "failure matrix",
    "duplicate routes block readiness",
  ]],
  ["content/docs/zh/(web)/web-testing.mdx", [
    "sdk_authored_endpoint_routes_through_the_real_ingress",
    "失败矩阵",
    "重复 Route 阻止 Readiness",
  ]],
  ["content/docs/(agent)/first-app.mdx", [
    "lenso plugin new company.uppercase",
    "lenso plugin pack",
    "lenso plugins add",
    "cargo run -p lenso-agent-cli -- contexts",
    "cargo run -p lenso-agent-cli",
    "lenso plugins remove company.uppercase --root",
  ]],
  ["content/docs/zh/(agent)/first-app.mdx", [
    "lenso plugin new company.uppercase",
    "lenso plugin pack",
    "lenso plugins add",
    "cargo run -p lenso-agent-cli -- contexts",
    "cargo run -p lenso-agent-cli",
    "lenso plugins remove company.uppercase --root",
  ]],
  ["content/docs/(plugins)/choose-plugin-path.mdx", [
    "Portable Rust Plugin",
    "Linked Rust Plugin",
    "Bun Plugin",
    "Interaction shape",
    "Execution class",
  ]],
  ["content/docs/zh/(plugins)/choose-plugin-path.mdx", [
    "可移植 Rust Plugin",
    "Linked Rust Plugin",
    "Bun Plugin",
    "交互形态",
    "Execution Class",
  ]],
  ["content/docs/(agent)/agent-development.mdx", [
    "Agent Home",
    "Choose the smallest change",
    "profiles install coding",
    "Configure an Agent",
    "Give the Agent a new Tool",
  ]],
  ["content/docs/zh/(agent)/agent-development.mdx", [
    "Agent Home",
    "选择最小改动",
    "profiles install coding",
    "配置 Agent",
    "为 Agent 添加一个 Tool",
  ]],
  ["content/docs/(agent)/agent-configuration.mdx", [
    "Direct local Plugin Root",
    "SQLite managed authority",
    "Injected authority",
    "configuration/proposals",
    "proposalDigest",
    "configuration/publications",
    "rollback-proposals",
    "materialize the complete desired state",
  ]],
  ["content/docs/zh/(agent)/agent-configuration.mdx", [
    "直接本地 Plugin Root",
    "SQLite 托管 Authority",
    "注入 Authority",
    "configuration/proposals",
    "proposalDigest",
    "configuration/publications",
    "rollback-proposals",
    "完整 Desired State",
  ]],
  ["content/docs/(plugins)/plugin-configuration.mdx", [
    "Package defaults",
    "Host configuration",
    "Instance patch",
    "lenso plugins configure",
    "Secret values must not enter",
  ]],
  ["content/docs/zh/(plugins)/plugin-configuration.mdx", [
    "Package default",
    "Host configuration",
    "Instance patch",
    "lenso plugins configure",
    "Secret 值不能进入",
  ]],
  ["content/docs/(start)/quickstart.mdx", [
    "self-contained",
    "--implementation auto",
    "completes this",
  ]],
  ["content/docs/zh/(start)/quickstart.mdx", [
    "自包含",
    "--implementation auto",
    "本 Quickstart 已完成",
  ]],
  ["content/docs/(plugins)/plugin-composition.mdx", [
    "lenso app init",
    "lenso plugins add ./example.echo/dist/example.echo-0.1.0.lenso-plugin --root ./my-app",
    "lenso app check",
  ]],
  ["content/docs/zh/(plugins)/plugin-composition.mdx", [
    "lenso app init",
    "lenso plugins add ./example.echo/dist/example.echo-0.1.0.lenso-plugin --root ./my-app",
    "lenso app check",
  ]],
  ["content/docs/(web)/web-capabilities.mdx", [
    "lenso-openapi",
    "There is deliberately no `enabled` field.",
    "Only that bound subset appears",
    '"document_path": "/openapi.json"',
  ]],
  ["content/docs/zh/(web)/web-capabilities.mdx", [
    "lenso-openapi",
    "这里有意不提供 `enabled` 字段。",
    "只包含这个显式绑定的子集",
    '"document_path": "/openapi.json"',
  ]],
  ["content/docs/(plugins)/bun-plugin-authoring.mdx", [
    "lenso plugin new example.echo --runtime bun",
    "lenso plugin dev --watch",
    "@lenso/bun",
  ]],
  ["content/docs/zh/(plugins)/bun-plugin-authoring.mdx", [
    "lenso plugin new example.echo --runtime bun",
    "lenso plugin dev --watch",
    "@lenso/bun",
  ]],
]) {
  const text = read(file);
  for (const marker of markers) {
    if (!text.includes(marker)) {
      failures.push(`${file}: missing current workflow marker ${JSON.stringify(marker)}`);
    }
  }
}

for (const file of [
  "content/docs/(start)/quickstart.mdx",
  "content/docs/zh/(start)/quickstart.mdx",
]) {
  const text = read(file);
  for (const forbidden of ["/path/to/", "lenso plugins search", "lenso plugins install"]) {
    if (text.includes(forbidden)) {
      failures.push(`${file}: quickstart depends on unavailable ${JSON.stringify(forbidden)}`);
    }
  }
}

for (const file of [
  "content/docs/(start)/quickstart.mdx",
  "content/docs/zh/(start)/quickstart.mdx",
]) {
  requireOrderedMarkers(file, [
    "### Rust",
    "lenso plugin new example.echo\n",
    "cd example.echo",
    "lenso plugin check",
    "lenso plugin dev",
    "--implementation auto",
    "lenso plugin pack",
    "cd ..",
    "### Bun / TypeScript",
    "lenso plugin new example.echo --runtime bun",
    "cd example.echo",
    "lenso plugin check",
    "lenso plugin dev",
    "--implementation auto",
    "lenso plugin pack",
    "cd ..",
  ]);
  requireCount(file, "lenso plugin check", 2);
  requireCount(file, "lenso plugin dev", 2);
  requireCount(file, "lenso plugin pack", 2);
  requireCount(file, "--implementation auto", 2);
  requireCount(file, "cd ..", 2);
}

if (failures.length > 0) {
  console.error(`Documentation checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Documentation checks passed: ${requiredCurrentPages.length * 2} current pages.`);
