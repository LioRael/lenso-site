import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export function walkFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      files.push(...walkFiles(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

export function isDraftDocument(file) {
  return /^draft:\s*true\s*$/m.test(readFileSync(file, "utf8"));
}

export function routeForDocument(docsRoot, file) {
  const segments = relative(docsRoot, file)
    .split(sep)
    .filter((segment) => !segment.startsWith("("))
    .map((segment) => segment.replace(/\.mdx$/, ""));
  if (segments.at(-1) === "index") segments.pop();
  return `/docs${segments.length ? `/${segments.join("/")}` : ""}`;
}
