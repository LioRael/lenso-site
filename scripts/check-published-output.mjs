import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDraftDocument, routeForDocument, walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const distRoot = join(root, "dist");
const outputRoot = existsSync(join(distRoot, "client")) ? join(distRoot, "client") : distRoot;
const failures = [];

if (!existsSync(outputRoot)) throw new Error("dist is missing; run this check after blume build");

if (existsSync(join(outputRoot, "index.html"))) {
  failures.push("dist/index.html: standalone homepage must not be published");
}

for (const file of [
  ".well-known/api-catalog",
  ".well-known/mcp.json",
  ".well-known/mcp/server-card.json",
  "agent-readability.json",
  "blume-search.json",
  "llms.txt",
  "llms-full.txt",
  "sitemap.xml",
]) {
  if (!existsSync(join(outputRoot, file))) failures.push(`dist/${file}: missing`);
}

for (const file of ["server/wrangler.json", "server/entry.mjs"]) {
  if (!existsSync(join(distRoot, file))) failures.push(`dist/${file}: missing server artifact`);
}

const wranglerOutput = join(distRoot, "server/wrangler.json");
if (existsSync(wranglerOutput)) {
  const generated = JSON.parse(readFileSync(wranglerOutput, "utf8"));
  const workerFirst = generated.assets?.run_worker_first;
  if (!Array.isArray(workerFirst) || !workerFirst.includes("/mcp")) {
    failures.push("dist/server/wrangler.json: /mcp must run through the Worker");
  }
}

const agentManifest = join(outputRoot, "agent-readability.json");
if (existsSync(agentManifest)) {
  const generated = JSON.parse(readFileSync(agentManifest, "utf8"));
  if (generated.artifacts?.mcp?.url !== "https://lenso.dev/mcp") {
    failures.push("dist/agent-readability.json: missing canonical MCP endpoint");
  }
  if (generated.artifacts?.markdown?.contentNegotiation !== "text/markdown") {
    failures.push("dist/agent-readability.json: missing Markdown content negotiation");
  }
}

const smokePages = [
  ["docs/index.html", ["Start with Lenso", "Pick the shortest useful start", "Resolved App Plan"]],
  ["docs/quickstart/index.html", ["lenso-cli", "Run the repeatable gates"]],
  ["docs/build-a-feature/index.html", ["Build a feature end to end", "Prove removal"]],
  ["docs/troubleshooting/index.html", ["Troubleshooting", "Fast triage"]],
  ["docs/zh/index.html", ["从 Lenso 开始", "选择最短可用入口", "portable Kernel"]],
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
