import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { routeForDocument } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const outRoot = join(root, "out");
const paths = [
  ["P1", "core/(start)/app-quickstart.mdx"],
  ["P2", "core/(start)/app-quickstart.mdx"],
  ["P3", "core/(plugins)/plugin-composition.mdx"],
  ["P4", "core/(start)/quickstart.mdx"],
  ["P5", "core/(start)/react-vite-app.mdx"],
  ["P6", "agent/(configure)/agent-configuration.mdx"],
  ["P7", "core/(start)/app-quickstart.mdx"],
  ["P8", "core/(start)/first-app-change.mdx"],
];
const failures = [];

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
  const html = existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";
  if (!html) failures.push(`${htmlPath}: missing published route`);
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
    if (html && (!row || !row.includes(`href="${route}/"`))) {
      failures.push(`${htmlPath}: ${id} and ${route} must be browser-visible`);
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

for (const locale of ["", "zh/"]) {
  const matrix = readFileSync(join(docsRoot, locale, "learning-path-smoke.mdx"), "utf8");
  const linkedWithdrawal = `/docs/${locale}core/plugin-lifecycle`;
  if (!matrix.includes(`](${linkedWithdrawal})`)) {
    failures.push(`learning-path-smoke.mdx: P8 must distinguish source-local linked withdrawal`);
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
console.log("Learning-path smoke checks passed: eight EN/ZH paths, published navigation, and Engine fixture inputs.");
