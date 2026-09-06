import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const failures = [];

const requiredCurrentPages = [
  "index.mdx",
  "core/index.mdx",
  "core/(start)/mental-model.mdx",
  "core/(start)/first-app-change.mdx",
  "core/(operate)/inspect-an-app.mdx",
  "core/(contribute)/agent-skills.mdx",
  "core/(start)/quickstart.mdx",
  "agent/index.mdx",
  "agent/(start)/first-turn.mdx",
  "agent/(start)/mental-model.mdx",
  "agent/(use)/profiles-and-tools.mdx",
  "agent/(use)/sessions-and-memory.mdx",
  "agent/(use)/subagents.mdx",
  "agent/(use)/surfaces.mdx",
  "agent/(extend)/first-app.mdx",
  "agent/(extend)/mcp-servers.mdx",
  "agent/(configure)/agent-configuration.mdx",
  "web/index.mdx",
  "web/(understand)/architecture.mdx",
  "web/(tutorial)/web-endpoint-plugin.mdx",
  "web/(tutorial)/web-host-integration.mdx",
  "web/(tutorial)/web-testing.mdx",
  "web/(guides)/protect-an-endpoint.mdx",
  "web/(guides)/call-upstream-api.mdx",
  "web/(guides)/web-capabilities.mdx",
  "web/(guides)/auth-plugin.mdx",
  "web/(operate)/deployment-boundary.mdx",
  "core/(runtime)/architecture.mdx",
  "core/(runtime)/project-and-plan.mdx",
  "core/(runtime)/runtime-lifecycle.mdx",
  "core/(plugins)/plugins-and-capabilities.mdx",
  "core/(plugins)/choose-plugin-path.mdx",
  "core/(plugins)/plugin-authoring.mdx",
  "core/(plugins)/linked-rust-plugin.mdx",
  "core/(plugins)/bun-plugin-authoring.mdx",
  "core/(plugins)/plugin-configuration.mdx",
  "core/(plugins)/plugin-composition.mdx",
  "core/(capabilities)/capability-authoring.mdx",
  "core/(building-blocks)/secrets-plugin.mdx",
  "core/(building-blocks)/postgres-kit.mdx",
  "core/(plugins)/named-dependencies.mdx",
  "core/(plugins)/document-sync.mdx",
  "core/(runtime)/typescript-host.mdx",
  "core/(runtime)/execution-adapters.mdx",
  "core/(building-blocks)/web-and-observability.mdx",
  "core/(reference)/repository-map.mdx",
  "core/(reference)/supported-workflows.mdx",
  "core/(reference)/architecture-decisions.mdx",
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
for (const requiredMarker of [
  'path: "/core"',
  'path: "/web"',
  'path: "/agent"',
  '["/quickstart", "/core/quickstart"]',
  '["/web-backend", "/web"]',
  '["/agent-development", "/agent"]',
]) {
  if (!config.includes(requiredMarker)) {
    failures.push(`blume.config.ts: missing navigation marker ${JSON.stringify(requiredMarker)}`);
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
    ["retired App Definition term", /App Definition/g],
    ["retired app resolve command", /lenso app resolve/g],
    ["retired definition flag", /--definition/g],
    ["retired plugin verify command", /lenso plugin verify/g],
  ]) {
    if (expression.test(text)) failures.push(`${relative(root, file)}: ${label}`);
  }
  // The accepted upstream fixture retains this exact directory/crate name.
  // Keep rejecting retired terminology in prose while allowing runnable source references.
  const terminologyText = text.replaceAll("vnext-plugin-authoring-v2", "plugin-authoring-fixture");
  if (retiredGenerationName.test(terminologyText)) {
    failures.push(`${relative(root, file)}: retired generation terminology`);
  }
}

const invariantFiles = [
  "content/docs/core/index.mdx",
  "content/docs/core/(runtime)/architecture.mdx",
  "content/docs/core/(reference)/supported-workflows.mdx",
];
for (const marker of ["Resolved App Plan", "Runtime Driver", "Execution Adapter"]) {
  if (!invariantFiles.some((file) => read(file).includes(marker))) {
    failures.push(`current docs: missing canonical marker ${JSON.stringify(marker)}`);
  }
}

for (const [file, markers] of [
  ["content/docs/core/(start)/first-app-change.mdx", [
    "lenso app init",
    "lenso plugins add",
    "lenso doctor",
    "lenso run",
    "lenso plugins remove",
  ]],
  ["content/docs/zh/core/(start)/first-app-change.mdx", [
    "lenso app init",
    "lenso plugins add",
    "lenso doctor",
    "lenso run",
    "lenso plugins remove",
  ]],
  ["content/docs/core/(operate)/inspect-an-app.mdx", [
    "lenso doctor",
    "lenso plugins list",
    "lenso app show",
    "lenso app check",
    "lenso run",
  ]],
  ["content/docs/zh/core/(operate)/inspect-an-app.mdx", [
    "lenso doctor",
    "lenso plugins list",
    "lenso app show",
    "lenso app check",
    "lenso run",
  ]],
  ["content/docs/core/(contribute)/agent-skills.mdx", [
    "lenso-app-configuration",
    "Start with a bounded request",
    "Require source inspection before implementation",
    "Build a Web backend",
    "Control how far the agent may deliver",
    "Recover when the agent goes in the wrong direction",
  ]],
  ["content/docs/zh/core/(contribute)/agent-skills.mdx", [
    "lenso-app-configuration",
    "从一个有边界的请求开始",
    "实现前必须检查源码",
    "构建 Web 后端",
    "控制 Agent 可以交付到哪里",
    "Agent 方向错误时如何纠正",
  ]],
  ["content/docs/web/index.mdx", [
    "POST /greetings",
    "Current authoring boundary",
    "Write the Endpoint Plugin",
    "Connect the Host and Ingress",
    "Prove the HTTP backend",
    "Definition of done",
  ]],
  ["content/docs/zh/web/index.mdx", [
    "POST /greetings",
    "当前 Authoring 边界",
    "编写 Endpoint Plugin",
    "连接 Host 与 Ingress",
    "证明 HTTP 后端",
    "完成条件",
  ]],
  ["content/docs/web/(tutorial)/web-endpoint-plugin.mdx", [
    "#[endpoint]",
    "EndpointProvider",
    "endpoint_attributes",
    "Connect the Host and Ingress",
  ]],
  ["content/docs/zh/web/(tutorial)/web-endpoint-plugin.mdx", [
    "#[endpoint]",
    "EndpointProvider",
    "endpoint_attributes",
    "连接 Host 与 Ingress",
  ]],
  ["content/docs/web/(tutorial)/web-host-integration.mdx", [
    "NativeModuleFactory",
    "plugins/lenso.web-ingress/web.toml",
    "many lenso.http.endpoint@1",
    "Prove the HTTP backend",
  ]],
  ["content/docs/zh/web/(tutorial)/web-host-integration.mdx", [
    "NativeModuleFactory",
    "plugins/lenso.web-ingress/web.toml",
    "many lenso.http.endpoint@1",
    "证明 HTTP 后端",
  ]],
  ["content/docs/web/(tutorial)/web-testing.mdx", [
    "sdk_authored_endpoint_routes_through_the_real_ingress",
    "failure matrix",
    "duplicate routes block readiness",
  ]],
  ["content/docs/zh/web/(tutorial)/web-testing.mdx", [
    "sdk_authored_endpoint_routes_through_the_real_ingress",
    "失败矩阵",
    "重复 Route 阻止 Readiness",
  ]],
  ["content/docs/agent/(extend)/first-app.mdx", [
    "lenso plugin new company.uppercase",
    "lenso plugin pack",
    "lenso plugins add",
    "lenso-agent-cli contexts --profile code",
    "lenso-agent-cli --profile code",
    "lenso plugins remove company.uppercase --root",
  ]],
  ["content/docs/zh/agent/(extend)/first-app.mdx", [
    "lenso plugin new company.uppercase",
    "lenso plugin pack",
    "lenso plugins add",
    "lenso-agent-cli contexts --profile code",
    "lenso-agent-cli --profile code",
    "lenso plugins remove company.uppercase --root",
  ]],
  ["content/docs/agent/(use)/sessions-and-memory.mdx", [
    "sessions.sqlite3",
    "sessions provenance",
    "Context compaction",
    "cross-Session Memory",
  ]],
  ["content/docs/zh/agent/(use)/sessions-and-memory.mdx", [
    "sessions.sqlite3",
    "sessions provenance",
    "Context Compaction",
    "跨 Session Memory",
  ]],
  ["content/docs/agent/(use)/subagents.mdx", [
    "delegate",
    "list_subagents",
    "review_worktree",
    "integrate_worktree",
  ]],
  ["content/docs/zh/agent/(use)/subagents.mdx", [
    "delegate",
    "list_subagents",
    "review_worktree",
    "integrate_worktree",
  ]],
  ["content/docs/agent/(extend)/mcp-servers.mdx", [
    'transport = "stdio"',
    'transport = "streamable_http"',
    "mcp__filesystem__<tool_name>",
    "lenso-agent-cli contexts",
  ]],
  ["content/docs/zh/agent/(extend)/mcp-servers.mdx", [
    'transport = "stdio"',
    'transport = "streamable_http"',
    "mcp__filesystem__<tool_name>",
    "lenso-agent-cli contexts",
  ]],
  ["content/docs/web/(guides)/protect-an-endpoint.mdx", [
    "AuthClient",
    "AuthenticatedHttpActor",
    "orders.api@1:read",
    "WWW-Authenticate",
  ]],
  ["content/docs/zh/web/(guides)/protect-an-endpoint.mdx", [
    "AuthClient",
    "AuthenticatedHttpActor",
    "orders.api@1:read",
    "WWW-Authenticate",
  ]],
  ["content/docs/web/(guides)/call-upstream-api.mdx", [
    "allowed_origins",
    "lenso.http.client@1",
    "ClientClient",
    "destination_not_allowed",
  ]],
  ["content/docs/zh/web/(guides)/call-upstream-api.mdx", [
    "allowed_origins",
    "lenso.http.client@1",
    "ClientClient",
    "destination_not_allowed",
  ]],
  ["content/docs/web/(operate)/deployment-boundary.mdx", [
    "cleartext HTTP/2",
    "lenso app check",
    "graceful-shutdown",
    "no framework-owned Dockerfile",
  ]],
  ["content/docs/zh/web/(operate)/deployment-boundary.mdx", [
    "Cleartext HTTP/2",
    "lenso app check",
    "Graceful-shutdown",
    "Framework-owned Dockerfile",
  ]],
  ["content/docs/core/(plugins)/choose-plugin-path.mdx", [
    "Portable Rust Plugin",
    "Linked Rust Plugin",
    "Bun Plugin",
    "Interaction shape",
    "Execution class",
  ]],
  ["content/docs/zh/core/(plugins)/choose-plugin-path.mdx", [
    "可移植 Rust Plugin",
    "Linked Rust Plugin",
    "Bun Plugin",
    "交互形态",
    "Execution Class",
  ]],
  ["content/docs/agent/index.mdx", [
    "Agent Home",
    "Choose the smallest change",
    "profiles install coding",
    "Configure an Agent",
    "Give the Agent a new Tool",
  ]],
  ["content/docs/zh/agent/index.mdx", [
    "Agent Home",
    "选择最小改动",
    "profiles install coding",
    "配置 Agent",
    "为 Agent 添加一个 Tool",
  ]],
  ["content/docs/agent/(configure)/agent-configuration.mdx", [
    "Direct local Plugin Root",
    "SQLite managed authority",
    "Injected authority",
    "configuration/proposals",
    "proposalDigest",
    "configuration/publications",
    "rollback-proposals",
    "materialize the complete desired state",
  ]],
  ["content/docs/zh/agent/(configure)/agent-configuration.mdx", [
    "直接本地 Plugin Root",
    "SQLite 托管 Authority",
    "注入 Authority",
    "configuration/proposals",
    "proposalDigest",
    "configuration/publications",
    "rollback-proposals",
    "完整 Desired State",
  ]],
  ["content/docs/core/(plugins)/plugin-configuration.mdx", [
    "Package defaults",
    "Host configuration",
    "Instance patch",
    "lenso plugins configure",
    "Secret values must not enter",
  ]],
  ["content/docs/zh/core/(plugins)/plugin-configuration.mdx", [
    "Package default",
    "Host configuration",
    "Instance patch",
    "lenso plugins configure",
    "Secret 值不能进入",
  ]],
  ["content/docs/core/(start)/quickstart.mdx", [
    "self-contained",
    "--implementation auto",
    "completes this",
  ]],
  ["content/docs/zh/core/(start)/quickstart.mdx", [
    "自包含",
    "--implementation auto",
    "本 Quickstart 已完成",
  ]],
  ["content/docs/core/(plugins)/plugin-composition.mdx", [
    "lenso app init",
    "lenso plugins add ./example.echo/dist/example.echo-0.1.0.lenso-plugin --root ./my-app",
    "lenso app check",
  ]],
  ["content/docs/zh/core/(plugins)/plugin-composition.mdx", [
    "lenso app init",
    "lenso plugins add ./example.echo/dist/example.echo-0.1.0.lenso-plugin --root ./my-app",
    "lenso app check",
  ]],
  ["content/docs/web/(guides)/web-capabilities.mdx", [
    "lenso-openapi",
    "There is deliberately no `enabled` field.",
    "Only that bound subset appears",
    '"document_path": "/openapi.json"',
  ]],
  ["content/docs/zh/web/(guides)/web-capabilities.mdx", [
    "lenso-openapi",
    "这里有意不提供 `enabled` 字段。",
    "只包含这个显式绑定的子集",
    '"document_path": "/openapi.json"',
  ]],
  ["content/docs/core/(plugins)/bun-plugin-authoring.mdx", [
    "lenso plugin new example.echo --runtime bun",
    "lenso plugin dev --watch",
    "@lenso/bun",
  ]],
  ["content/docs/zh/core/(plugins)/bun-plugin-authoring.mdx", [
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
  "content/docs/core/(start)/quickstart.mdx",
  "content/docs/zh/core/(start)/quickstart.mdx",
]) {
  const text = read(file);
  for (const forbidden of ["/path/to/", "lenso plugins search", "lenso plugins install"]) {
    if (text.includes(forbidden)) {
      failures.push(`${file}: quickstart depends on unavailable ${JSON.stringify(forbidden)}`);
    }
  }
}

for (const file of [
  "content/docs/core/(start)/quickstart.mdx",
  "content/docs/zh/core/(start)/quickstart.mdx",
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
