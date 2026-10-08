import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadSource, frameworkRef } from "../docs.source.mjs";

const source = await loadSource({ root: process.cwd() });
const pages = source.pages.map((page) => ({
  id: page.id, locale: page.locale, url: page.url, title: page.title, description: page.description,
  markdown: `/_lenso/markdown/${page.id}.md`,
  revision: createHash("sha256").update(page.markdown).digest("hex"),
  edition: page.metadata.edition,
}));
const revision = createHash("sha256").update(JSON.stringify(pages)).digest("hex");
const inventory = { schemaVersion: 1, edition: "typescript-source-preview", frameworkRef, docsFramework: "@lenso/docs@0.1.0", revision, pages };
await writeFile("out/docs-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
const index = ["# Lenso", "", "Bun-first TypeScript application framework. Source preview: " + frameworkRef + ".", "Published Core quickstart is verified separately; see installation for artifact differences.", "", ...pages.map((page) => `- [${page.title} (${page.locale})](https://lenso.dev${page.markdown}): ${page.description}`)].join("\n") + "\n";
await writeFile("out/llms.txt", index);
await writeFile("out/llms-full.txt", index + "\n" + source.pages.map((page) => `\n# ${page.title} (${page.locale})\nSource: https://lenso.dev${page.url}/\n\n${page.markdown}`).join("\n"));
// The docs framework writes byte-exact per-page Markdown; verify instead of recompiling it.
for (const page of source.pages) {
  if (await readFile(`out/_lenso/markdown/${page.id}.md`, "utf8") !== page.markdown) throw new Error(`Markdown mismatch: ${page.id}`);
}
console.log(`Static catalogs: ${pages.length} pages, corpus ${revision.slice(0, 12)}.`);
