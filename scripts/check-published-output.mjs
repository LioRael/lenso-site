import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDraftDocument, routeForDocument, walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const outputRoot = join(root, "dist");
const failures = [];

if (!existsSync(outputRoot)) throw new Error("dist is missing; run this check after blume build");

if (existsSync(join(outputRoot, "index.html"))) {
  failures.push("dist/index.html: standalone homepage must not be published");
}

for (const file of ["blume-search.json", "llms.txt", "llms-full.txt", "sitemap.xml"]) {
  if (!existsSync(join(outputRoot, file))) failures.push(`dist/${file}: missing`);
}

const smokePages = [
  ["docs/index.html", ["Introduction", "Why Lenso exists", "Resolved App Plan"]],
  ["docs/quickstart/index.html", ["Create and exercise a Plugin", "Create an App workspace"]],
  ["docs/zh/index.html", ["介绍", "为什么需要 Lenso", "可移植 Kernel"]],
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
