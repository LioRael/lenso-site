import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { createSearchAPI } from "fumadocs-core/search/server";
import { structure } from "fumadocs-core/mdx-plugins/remark-structure";
import { createChineseTokenizer } from "./components/chinese-tokenizer.mjs";

export const frameworkRef = "6e239c71a38279885facce133ceb847bbfe12f2f";
export const legacyRef = "bce1f2c08d238cec9e57a4c7a0218c8413b804c5";
export const groups = [
  ["Start here", "从这里开始", ["introduction", "quickstart", "installation", "examples"]],
  ["Application model", "应用模型", ["composition", "lifecycle", "configuration", "engine", "cli"]],
  ["Web and identity", "Web 与身份", ["web", "fetch", "react", "auth"]],
  ["Data and background work", "数据与后台工作", ["database", "files", "tasks"]],
  ["Operate and extend", "运维与扩展", ["manage", "observability", "agents", "testing", "workers", "deployment"]],
  ["Reference", "参考", ["upgrade", "api"]],
];

function frontmatter(text, name) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) throw new Error(`Missing frontmatter: ${name}`);
  const value = (key) => block[1].match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1].replace(/^["']|["']$/g, "");
  if (!value("title") || !value("description")) throw new Error(`Missing title/description: ${name}`);
  return { title: value("title"), description: value("description") };
}

async function legacyPaths(root) {
  const paths = [];
  async function walk(directory, parts = []) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      if (item.isDirectory()) await walk(path.join(directory, item.name), item.name.startsWith("(") ? parts : [...parts, item.name]);
      else if (item.name.endsWith(".mdx")) paths.push("/docs/" + [...parts, ...(item.name === "index.mdx" ? [] : [item.name.slice(0, -4)])].join("/"));
    }
  }
  await walk(path.join(root, "legacy/rust-site/content"));
  return paths.map((url) => url.replace(/\/$/, ""));
}

// Use the host's static-search override; this parses only authored Chinese
// Markdown, without another MDX compile or any framework API generation.
export async function prepare({ root }) {
  const records = [];
  const inputs = [await readFile(path.join(root, "components/chinese-tokenizer.mjs"), "utf8")];
  for (const slug of groups.flatMap((group) => group[2])) {
    const markdown = await readFile(path.join(root, "content/zh", slug + ".mdx"), "utf8");
    inputs.push(markdown);
    const url = `/docs/zh/${slug}`;
    records.push({ id: url, url, ...frontmatter(markdown, slug), markdown });
  }
  const directory = path.join(root, ".lenso-search");
  const revision = createHash("sha256").update(JSON.stringify(inputs)).digest("hex");
  if (await readFile(path.join(directory, "revision"), "utf8").catch(() => "") === revision) return;
  const indexes = records.map(({ markdown, ...record }) => ({
    ...record,
    structuredData: structure(markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, "").replace(/^# .+\r?\n/, "")),
  }));
  const search = createSearchAPI("advanced", { indexes, tokenizer: createChineseTokenizer() });
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "zh.json"), JSON.stringify(await search.export()));
  await writeFile(path.join(directory, "revision"), revision);
}

export async function loadSource({ root }) {
  const pages = [];
  for (const locale of ["en", "zh"]) {
    for (const [groupIndex, group] of groups.entries()) {
      for (const [order, slug] of group[2].entries()) {
        const markdown = await readFile(path.join(root, "content", locale, slug + ".mdx"), "utf8");
        pages.push({
          id: `${locale}/${slug}`, slug, locale,
          url: `${locale === "zh" ? "/docs/zh" : "/docs"}/${slug}`,
          ...frontmatter(markdown, `${locale}/${slug}`), markdown,
          translationKey: slug,
          navigation: { group: group[locale === "zh" ? 1 : 0], order: groupIndex * 100 + order },
          metadata: { frameworkRef, edition: slug === "quickstart" ? "published-core-0.1.0" : "typescript-source-preview" },
        });
      }
    }
  }
  const occupied = new Set(pages.map((page) => page.url));
  const redirects = [
    { from: "/docs", to: "/docs/introduction" },
    { from: "/docs/zh", to: "/docs/zh/introduction" },
    ...[...new Set(await legacyPaths(root))].filter((url) => url && !occupied.has(url) && !["/docs", "/docs/zh"].includes(url)).map((from) => ({ from, to: from.startsWith("/docs/zh/") ? "/docs/zh/upgrade" : "/docs/upgrade", permanent: true })),
  ];
  return {
    pages, redirects,
    search: { zh: ".lenso-search/zh.json" },
    generatedPaths: [".lenso-search"],
    routes: ["en", "zh"].map((locale) => ({
      path: locale === "zh" ? "/zh" : "/", locale,
      module: "routes/home.tsx", props: { locale },
      metadata: {
        title: { absolute: locale === "zh" ? "Lenso · 用普通服务构建模块化应用" : "Lenso · Ordinary services. Composable applications." },
        description: locale === "zh" ? "Bun 优先的 TypeScript 插件框架：明确依赖、资源归属与平台边界。" : "A Bun-first TypeScript plugin framework with explicit dependencies, resource ownership and optional platform adapters.",
        alternates: { canonical: locale === "zh" ? "/zh/" : "/", languages: { en: "/", "zh-CN": "/zh/" } },
      },
    })),
    watchPaths: ["content/en", "content/zh", "routes", "components"],
  };
}
