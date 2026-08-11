import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDraftDocument, routeForDocument, walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const outputRoot = join(root, "dist");

if (!existsSync(outputRoot)) {
  throw new Error("dist is missing; run this check after blume build");
}

const draftDocuments = walkFiles(docsRoot).filter(
  (file) => file.endsWith(".mdx") && isDraftDocument(file),
);
const generatedCatalogs = [
  "blume-search.json",
  "llms.txt",
  "llms-full.txt",
  "sitemap.xml",
  "agent-readability.json",
].map((file) => join(outputRoot, file));
const failures = [];
const catalogContents = new Map();

for (const catalog of generatedCatalogs) {
  if (!existsSync(catalog)) {
    failures.push(`${relative(root, catalog)}: generated publication catalog is missing`);
  } else {
    catalogContents.set(catalog, readFileSync(catalog, "utf8"));
  }
}

for (const document of draftDocuments) {
  const route = routeForDocument(docsRoot, document);
  const routePath = route.slice(1);
  const generatedPaths = [
    join(outputRoot, routePath, "index.html"),
    join(outputRoot, `${routePath}.md`),
    join(outputRoot, `${routePath}.mdx`),
    join(outputRoot, "og", `${routePath}.png`),
  ];

  for (const generated of generatedPaths) {
    if (existsSync(generated)) {
      failures.push(
        `${relative(root, document)}: draft route was published as ${relative(root, generated)}`,
      );
    }
  }

  for (const [catalog, content] of catalogContents) {
    if (content.includes(route)) {
      failures.push(`${relative(root, document)}: draft route appears in ${relative(root, catalog)}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Published-output checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Published-output checks passed; ${draftDocuments.length} draft documents are absent from routes, search, agent catalogs, and sitemap.`,
);
