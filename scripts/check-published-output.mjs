import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDraftDocument, routeForDocument, walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const outputRoot = process.env.BLUME_OUTPUT_ROOT
  ? resolve(root, process.env.BLUME_OUTPUT_ROOT)
  : join(root, "dist");
const failures = [];

if (!existsSync(outputRoot)) throw new Error("dist is missing; run this check after blume build");

if (existsSync(join(outputRoot, "index.html"))) {
  failures.push("dist/index.html: standalone homepage must not be published");
}

for (const file of ["blume-search.json", "llms.txt", "llms-full.txt", "sitemap.xml"]) {
  if (!existsSync(join(outputRoot, file))) failures.push(`dist/${file}: missing`);
}

const smokePages = [
  ["docs/index.html", ["Lenso documentation", "What do you want to build?", "Learn the core framework"]],
  ["docs/core/index.html", ["Core framework", "Why Lenso exists", "Resolved App Plan"]],
  ["docs/core/quickstart/index.html", ["Create and exercise a Plugin", "Connect the Bundle to an App"]],
  ["docs/core/first-app-change/index.html", ["Change your first App", "Initialize the App workspace", "Run the current Host"]],
  ["docs/core/inspect-an-app/index.html", ["Inspect and troubleshoot an App", "lenso doctor", "lenso app show"]],
  ["docs/web/index.html", ["Build a Web backend", "Current authoring boundary", "Definition of done"]],
  ["docs/web/protect-an-endpoint/index.html", ["Protect an Endpoint", "Authenticate", "Authorize"]],
  ["docs/web/deployment-boundary/index.html", ["Prepare a Web Host for deployment", "TLS", "Deployment checklist"]],
  ["docs/agent/index.html", ["Build an Agent product with Lenso", "Choose the smallest change", "Add one Tool"]],
  ["docs/agent/subagents/index.html", ["Delegate to child Agents", "list_subagents", "integrate_worktree"]],
  ["docs/agent/mcp-servers/index.html", ["Connect an MCP server", "streamable_http", "Context Source"]],
  ["docs/zh/index.html", ["Lenso 文档", "你想构建什么？", "学习核心框架"]],
  ["docs/zh/core/index.html", ["核心框架", "为什么需要 Lenso", "可移植 Kernel"]],
  ["docs/zh/core/first-app-change/index.html", ["修改第一个 App", "初始化 App Workspace", "运行当前 Host"]],
];

for (const [file, markers] of smokePages) {
  const absolute = join(outputRoot, file);
  if (!existsSync(absolute)) {
    failures.push(`dist/${file}: missing published smoke page`);
    continue;
  }
  const html = readFileSync(absolute, "utf8");
  for (const marker of markers) {
    if (!html.includes(marker)) failures.push(`dist/${file}: missing ${JSON.stringify(marker)}`);
  }
}

const draftDocuments = walkFiles(docsRoot).filter(
  (file) => file.endsWith(".mdx") && isDraftDocument(file),
);
for (const document of draftDocuments) {
  const route = routeForDocument(docsRoot, document).slice(1);
  for (const generated of [
    join(outputRoot, route, "index.html"),
    join(outputRoot, `${route}.md`),
    join(outputRoot, `${route}.mdx`),
  ]) {
    if (existsSync(generated)) {
      failures.push(`${relative(root, document)}: draft published as ${relative(root, generated)}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Published-output checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Published-output checks passed: current EN/ZH docs, catalogs, and draft exclusion.",
);
