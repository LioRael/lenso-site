import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const pages = [
  ["", "Lenso 文档"],
  ["cli", "Lenso CLI"],
  ["cli/installation", "安装"],
  ["cli/quickstart", "快速开始"],
  ["cli/extensions", "扩展与预设"],
  ["cli/code", "Code 扩展"],
  ["cli/shadcn", "shadcn 扩展"],
  ["cli/configuration", "配置、锁文件与缓存"],
  ["cli/automation", "自动化与 JSON"],
  ["cli/authoring", "开发与发布扩展"],
  ["cli/embedding", "嵌入 Rust CLI"],
  ["docs", "Lenso Docs"],
  ["docs/quickstart", "快速开始"],
  ["docs/content", "编写内容"],
  ["docs/configuration", "站点配置"],
  ["docs/customization", "界面定制"],
  ["docs/deployment", "构建与部署"],
] as const;

const englishPages = [
  ["", "Lenso documentation"],
  ["cli", "Lenso CLI"],
  ["cli/installation", "Installation"],
  ["cli/quickstart", "Quickstart"],
  ["cli/extensions", "Extensions and presets"],
  ["cli/code", "Code extension"],
  ["cli/shadcn", "shadcn extension"],
  ["cli/configuration", "Configuration, lockfile, and cache"],
  ["cli/automation", "Automation and JSON"],
  ["cli/authoring", "Developing and publishing extensions"],
  ["cli/embedding", "Embedding in a Rust CLI"],
  ["docs", "Lenso Docs"],
  ["docs/quickstart", "Quickstart"],
  ["docs/content", "Writing content"],
  ["docs/configuration", "Site configuration"],
  ["docs/customization", "Customization"],
  ["docs/deployment", "Build and deployment"],
] as const;

test("the static export contains the documented pages and their headings", () => {
  for (const [route, heading] of pages) {
    const file = join("out", route, "index.html");
    expect(existsSync(file)).toBe(true);
    const html = readFileSync(file, "utf8");
    expect(html.match(/<h1\b[^>]*>(.*?)<\/h1>/)?.[1]).toBe(heading);
  }
});

test("translated pages expose the built-in language menu", () => {
  for (const [route, heading] of englishPages) {
    const englishFile = join("out", "en", route, "index.html");
    expect(existsSync(englishFile)).toBe(true);
    if (!existsSync(englishFile)) continue;

    const english = readFileSync(englishFile, "utf8");
    const chinese = readFileSync(join("out", route, "index.html"), "utf8");

    expect(english).toContain('<html lang="en"');
    expect(chinese).toContain('<html lang="zh-CN"');
    expect(english.match(/<h1\b[^>]*>(.*?)<\/h1>/)?.[1]).toBe(heading);
    expect(english).toContain('aria-label="Change language"');
    expect(chinese).toContain('aria-label="切换语言"');
    expect(english).not.toContain('aria-label="阅读中文版"');
    expect(chinese).not.toContain('aria-label="Read in English"');
  }
});

test("both topics are reachable from the home page in each language", () => {
  for (const [locale, prefix] of [
    ["", ""],
    ["en", "/en"],
  ] as const) {
    const html = readFileSync(join("out", locale, "index.html"), "utf8");
    expect(html).toContain(`href="${prefix}/cli/"`);
    expect(html).toContain(`href="${prefix}/docs/"`);
  }
});

test("English navigation and search use the English collection", () => {
  const html = readFileSync(join("out", "en", "index.html"), "utf8");
  expect(html).toContain("Lenso CLI");
  expect(html).toContain("Lenso Docs");
  expect(existsSync(join("out", "_lenso", "search", "en.json"))).toBe(true);
});

test("the header links to the Lenso repository in both languages and topics", () => {
  for (const prefix of ["", "en"] as const) {
    for (const route of ["cli", "docs"] as const) {
      const html = readFileSync(join("out", prefix, route, "index.html"), "utf8");
      const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? "";
      const link = header.match(/<a\b[^>]*aria-label="Lenso on GitHub"[^>]*>/)?.[0] ?? "";
      expect(link).toContain('href="https://github.com/LioRael/lenso"');
    }
  }
});

test("topic sections switch between separate navigation lists in each language", () => {
  for (const prefix of ["", "/en"] as const) {
    for (const [route, topic, ownPage, otherPage] of [
      ["cli", "cli", "cli/installation", "docs/customization"],
      ["cli/quickstart", "cli", "cli/installation", "docs/customization"],
      ["docs", "docs", "docs/customization", "cli/installation"],
      ["docs/quickstart", "docs", "docs/customization", "cli/installation"],
    ] as const) {
      const html = readFileSync(join("out", prefix, route, "index.html"), "utf8");
      const sectionLabel = prefix ? "Documentation sections" : "文档分区";
      const pageLabel = prefix ? "Documentation pages" : "文档页面";
      const sections =
        html.match(new RegExp(`<nav aria-label="${sectionLabel}"[\\s\\S]*?<\\/nav>`))?.[0] ?? "";
      const pages =
        html.match(new RegExp(`<nav aria-label="${pageLabel}"[\\s\\S]*?<\\/nav>`))?.[0] ?? "";
      expect(sections.includes(`href="${prefix}/cli/"`)).toBe(true);
      expect(sections.includes(`href="${prefix}/docs/"`)).toBe(true);
      for (const [section, title] of [
        ["cli", "Lenso CLI"],
        ["docs", "Lenso Docs"],
      ] as const) {
        const link = sections.match(
          new RegExp(`<a\\b[^>]*href="${prefix}/${section}/"[^>]*>[\\s\\S]*?<\\/a>`),
        )?.[0];
        expect(link).toContain(title);
        expect(link).toMatch(/<svg\b[^>]*aria-hidden="true"/);
      }
      expect(sections.match(/<a aria-current="page"[^>]*>/)?.[0]).toContain(
        `href="${prefix}/${topic}/"`,
      );
      expect(pages.includes(`href="${prefix}/${ownPage}/"`)).toBe(true);
      expect(pages.includes(`href="${prefix}/${otherPage}/"`)).toBe(false);
      expect(html.includes("CLI on GitHub") || html.includes("Docs on GitHub")).toBe(false);
    }
  }
});
