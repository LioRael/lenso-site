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

function htmlFiles(directory) {
  return walkFiles(directory).filter((file) => file.endsWith(".html"));
}

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

const quickstartOutput = join(outputRoot, "docs/quickstart/index.html");
if (!existsSync(quickstartOutput)) {
  failures.push(`${relative(root, quickstartOutput)}: published smoke page is missing`);
} else {
  const quickstartHtml = readFileSync(quickstartOutput, "utf8");
  const smokeAssertions = [
    {
      description: "rendered Quickstart body is missing",
      matches: quickstartHtml.includes("This shipped command starts the generated Host"),
    },
    {
      description: "header repository does not point to the Lenso product repository",
      matches:
        /<a\b(?=[^>]*aria-label="GitHub repository")(?=[^>]*href="https:\/\/github\.com\/LioRael\/lenso")[^>]*>/.test(
          quickstartHtml,
        ),
    },
    {
      description: "Edit on GitHub does not point to the lenso-site source file",
      matches:
        /<a\b(?=[^>]*href="https:\/\/github\.com\/LioRael\/lenso-site\/edit\/main\/content\/docs\/\(host\)\/quickstart\.mdx")[^>]*>/.test(
          quickstartHtml,
        ),
    },
  ];

  for (const assertion of smokeAssertions) {
    if (!assertion.matches) {
      failures.push(`${relative(root, quickstartOutput)}: ${assertion.description}`);
    }
  }
}

const invalidHeaderRepoPages = htmlFiles(outputRoot).filter((file) => {
  const html = readFileSync(file, "utf8");
  const anchors = html.match(/<a\b[^>]*aria-label="GitHub repository"[^>]*>/g) ?? [];
  return anchors.some(
    (anchor) => !anchor.includes('href="https://github.com/LioRael/lenso"'),
  );
});

for (const page of invalidHeaderRepoPages) {
  failures.push(
    `${relative(root, page)}: header repository does not point to the Lenso product repository`,
  );
}

if (failures.length > 0) {
  console.error(`Published-output checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Published-output checks passed; Quickstart rendered correctly and ${draftDocuments.length} draft documents are absent from routes, search, agent catalogs, and sitemap.`,
);
