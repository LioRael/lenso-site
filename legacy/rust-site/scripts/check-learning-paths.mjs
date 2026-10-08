import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { routeForDocument } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const outRoot = join(root, "out");
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--source-only")) {
  console.error("Usage: node scripts/check-learning-paths.mjs [--source-only]");
  process.exit(2);
}
const sourceOnly = args[0] === "--source-only";
const paths = [
  ["P1", "core/(start)/app-quickstart.mdx"],
  ["P2", "core/(start)/app-quickstart.mdx"],
  ["P3", "core/(plugins)/plugin-composition.mdx"],
  ["P4", "core/(start)/quickstart.mdx"],
  ["P5", "core/(start)/react-vite-app.mdx"],
  ["P6", "core/(plugins)/plugin-configuration.mdx"],
  ["P7", "core/(start)/react-vite-app.mdx"],
  ["P8", "core/(operate)/plugin-lifecycle.mdx"],
];
const failures = [];

function pathSection(markdown, id) {
  const start = markdown.indexOf(`\n## ${id}.`);
  if (start < 0) return "";
  const end = markdown.indexOf("\n## ", start + 1);
  return markdown.slice(start, end < 0 ? undefined : end);
}

for (const locale of ["", "zh/"]) {
  const matrix = join(docsRoot, locale, "learning-path-smoke.mdx");
  if (!existsSync(matrix)) {
    failures.push(`${matrix}: missing`);
    continue;
  }
  const markdown = readFileSync(matrix, "utf8");
  if (locale && /\*\*(?:Smoke|边界)：\*\*\S/u.test(markdown)) {
    failures.push(`${matrix}: Chinese smoke labels need a space to render as emphasis`);
  }
  const htmlPath = join(outRoot, "docs", locale, "learning-path-smoke", "index.html");
  const html = !sourceOnly && existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";
  if (!sourceOnly && !html) failures.push(`${htmlPath}: missing published route`);
  for (const [id, relativeFile] of paths) {
    const document = join(docsRoot, locale, relativeFile);
    if (!existsSync(document)) {
      failures.push(`${document}: missing path target`);
      continue;
    }
    const route = routeForDocument(docsRoot, document);
    if (!markdown.includes(`| ${id} |`) || !markdown.includes(`](${route})`)) {
      failures.push(`${matrix}: ${id} must link to ${route}`);
    }
    const row = html.match(new RegExp(`<tr><td>${id}</td>[\\s\\S]*?</tr>`))?.[0];
    if (!sourceOnly && html && (!row || !row.includes(`href="${route}/"`))) {
      failures.push(`${htmlPath}: ${id} and ${route} must be browser-visible`);
    }
  }
  for (const [id, markers] of [
    ["P6", ["app show", "app check", `/docs/${locale}agent/agent-configuration`]],
    ["P7", ["fixtures/vnext-knowledge-base-app/README.md", "--package-only", "--linked-snapshot", "--trust",
      "--auth-crate", "--jobs-crate", "--secrets-crate", "--trust-linked-build-from-crates", "crates.io"]],
    ["P8", ["default.disabled", "app build", "app check", "app show", "app unadopt"]],
  ]) {
    const section = pathSection(markdown, id);
    for (const marker of markers) {
      if (!section.includes(marker)) failures.push(`${matrix}: ${id} missing current App path boundary ${marker}`);
    }
  }
}

for (const locale of ["", "zh/"]) {
  const guide = join(docsRoot, locale, "core/(plugins)/plugin-composition.mdx");
  const markdown = readFileSync(guide, "utf8");
  for (const marker of ["lenso plugins install", 'app add "$PLUGIN_ID@$VERSION"',
    "--linked-snapshot", "--trust", "--crate", "app build --out dist-linked-review"]) {
    if (!markdown.includes(marker)) failures.push(`${guide}: missing release-path boundary ${marker}`);
  }
}

for (const file of [
  "examples/engine-extension/engine.json",
  "examples/engine-extension/content/intro.md",
  "examples/engine-extension/tools/summary/engine-plugin.json",
  "examples/engine-extension/tools/summary/summary.mjs",
  "scripts/smoke-engine-extension.mjs",
]) {
  if (!existsSync(join(root, file))) failures.push(`${file}: missing runnable fixture`);
}
const workflowPath = join(root, "examples/engine-extension/engine.json");
const manifestPath = join(root, "examples/engine-extension/tools/summary/engine-plugin.json");
if (existsSync(workflowPath) && existsSync(manifestPath)) {
  const workflow = JSON.parse(readFileSync(workflowPath, "utf8"));
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (workflow.plugins?.length !== 1 || workflow.plugins[0] !== manifest.identity
    || manifest.program !== "node" || !manifest.artifacts?.includes("summary.mjs")) {
    failures.push("Engine fixture workflow and selected processor manifest do not agree");
  }
}

if (failures.length) {
  console.error(`Learning-path smoke checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Learning-path ${sourceOnly ? "source" : "published"} checks passed: eight EN/ZH paths, current App boundaries, and Engine fixture inputs${sourceOnly ? "; rendered routes not checked" : "; published navigation checked"}.`);
