import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { loadSource, groups, frameworkRef } from "../docs.source.mjs";

const root = process.cwd();
const source = await loadSource({ root });
const byUrl = new Map(source.pages.map((page) => [page.url, page]));
const slugs = groups.flatMap((group) => group[2]);
const failures = [];
for (const locale of ["en", "zh"]) {
  const files = (await readdir(`content/${locale}`)).filter((name) => name.endsWith(".mdx"));
  assert.deepEqual(files.sort(), slugs.map((slug) => `${slug}.mdx`).sort());
}
const frameworkFiles = process.env.LENSO_SOURCE_CHECKOUT
  ? new Set(execFileSync("git", ["ls-tree", "-r", "--name-only", frameworkRef], { cwd: process.env.LENSO_SOURCE_CHECKOUT, encoding: "utf8" }).trim().split("\n"))
  : undefined;
for (const page of source.pages) {
  const text = page.markdown;
  const body = text.replace(/^---[\s\S]*?---/, "");
  if (body.length < 1200) failures.push(`${page.id}: insufficient task content`);
  if (/\/Users\/|TODO|lorem ipsum|coming soon|待补充/i.test(text)) failures.push(`${page.id}: placeholder or private path`);
  if ((text.match(/^```/gm)?.length ?? 0) % 2) failures.push(`${page.id}: unclosed code fence`);
  const prose = body.replace(/```[\s\S]*?```/g, "");
  for (const match of prose.matchAll(/\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)) {
    const url = match[1];
    if (url.startsWith("/")) {
      const local = url.split(/[?#]/)[0].replace(/\/$/, "");
      if (local.startsWith("/docs") && !byUrl.has(local) && !["/docs", "/docs/zh"].includes(local)) failures.push(`${page.id}: broken route ${url}`);
      if (page.locale === "zh" && local.startsWith("/docs/") && !local.startsWith("/docs/zh/")) failures.push(`${page.id}: cross-language route ${url}`);
      if (!local.startsWith("/docs") && local && !["/zh"].includes(local)) {
        try { await readFile(path.join(root, "public", local)); } catch { failures.push(`${page.id}: missing asset ${url}`); }
      }
    }
    const upstream = url.match(new RegExp(`^https://github.com/LioRael/lenso/(?:blob|tree)/${frameworkRef}/([^#?]+)`));
    if (upstream && frameworkFiles && !frameworkFiles.has(upstream[1]) && ![...frameworkFiles].some((file) => file.startsWith(upstream[1] + "/"))) failures.push(`${page.id}: nonexistent pinned source ${upstream[1]}`);
  }
}
assert.equal(source.pages.length, 48);
assert.equal(new Set(source.pages.map((page) => page.id)).size, 48);
assert.equal(failures.length, 0, failures.join("\n"));
console.log(`Content: 48 bilingual pages, exact navigation parity, local links, fences and ${frameworkFiles ? "pinned upstream files" : "source identity"} passed.`);
