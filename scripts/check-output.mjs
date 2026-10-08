import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { create, load, search } from "@orama/orama";
import { createChineseTokenizer } from "../components/chinese-tokenizer.mjs";
import { loadSource } from "../docs.source.mjs";

const source = await loadSource({ root: process.cwd() });
for (const page of source.pages) {
  const html = await readFile(`out${page.url}/index.html`, "utf8");
  assert.ok(html.includes("main-content"), `${page.id}: missing reading region`);
  assert.ok(html.includes(page.locale === "zh" ? 'lang="zh-CN"' : 'lang="en"'), `${page.id}: wrong language`);
  assert.ok(html.includes("_lenso/markdown/"), `${page.id}: missing source controls`);
}
for (const locale of ["en", "zh"]) {
  const index = await readFile(`out/_lenso/search/${locale}.json`, "utf8");
  assert.ok(index.includes("configuration"));
  assert.ok(!index.includes("core/quickstart"), "archived corpus in search");
  if (locale === "zh") {
    const database = create({ schema: { _: "string" }, components: { tokenizer: createChineseTokenizer() } });
    load(database, JSON.parse(index));
    for (const [term, slug] of [["配置", "configuration"], ["数据库", "database"], ["Drizzle", "database"]]) {
      const results = await search(database, { term, properties: ["content"], limit: 100 });
      assert.ok(results.hits.some((hit) => hit.document.url.startsWith(`/docs/zh/${slug}`)), `Chinese search cannot find ${term}`);
    }
  }
}
for (const url of ["", "/zh"]) assert.ok((await readFile(`out${url}/index.html`, "utf8")).includes("home-title"));
const inventory = JSON.parse(await readFile("out/docs-inventory.json", "utf8"));
assert.equal(inventory.pages.length, 48);
assert.ok((await readFile("out/_redirects", "utf8")).includes("/docs/core/quickstart /docs/upgrade"));
assert.ok(!(await readFile("out/llms-full.txt", "utf8")).includes("lenso app create"));
assert.ok((await readFile("out/404.html", "utf8")).includes("Page not found"));
console.log("Export: HTML locales, search, exact Markdown, catalogs, legacy redirect and 404 passed.");
