import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { create, load, search } from "@orama/orama";
import { createChineseTokenizer } from "../components/chinese-tokenizer.mjs";

const packageFile = fileURLToPath(import.meta.resolve("@lenso/docs/package.json"));
const docsPackage = JSON.parse(await readFile(packageFile, "utf8"));
assert.equal(docsPackage.version, "0.1.0", "integration must use the exact published docs version");
const manifest = JSON.parse(await readFile("out/docs-inventory.json", "utf8"));
assert.equal(manifest.docsFramework, "@lenso/docs@0.1.0");
assert.equal(manifest.frameworkRef, "549b9870acb6af239faf79245179a4f1f7e60cdb");
assert.equal(manifest.pages.length, 48);

// Allocate a loopback port; the public CLI does not accept port zero.
const reservation = createServer();
await new Promise((resolvePort, reject) => {
  reservation.once("error", reject);
  reservation.listen(0, "127.0.0.1", resolvePort);
});
const port = reservation.address().port;
await new Promise((closed) => reservation.close(closed));
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, [
  resolve(dirname(packageFile), docsPackage.bin["lenso-docs"]), "preview", "--port", String(port),
], { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
let output = "", exited = false, startupError;
for (const stream of [child.stdout, child.stderr]) stream.on("data", (bytes) => { output = (output + bytes).slice(-8000); });
child.once("error", (error) => { startupError = error; });
child.once("exit", () => { exited = true; });

async function get(path, options) {
  return fetch(base + path, { signal: AbortSignal.timeout(5000), ...options });
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (startupError) throw startupError;
    if (exited) throw new Error(`Docs preview exited before readiness:\n${output}`);
    try { if ((await get("/")).status === 200) { ready = true; break; } } catch { /* preview is starting */ }
    await delay(100);
  }
  assert.ok(ready, `Docs preview did not become ready:\n${output}`);
  for (const path of ["/", "/zh/", "/docs/quickstart/", "/docs/zh/configuration/", "/docs/manage/", "/docs/zh/manage/"]) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("content-type"), /text\/html/);
    const body = await response.text();
    assert.ok(body.includes(path.includes("/zh") ? 'lang="zh-CN"' : 'lang="en"'), path);
    assert.ok(body.includes(path === "/" || path === "/zh/" ? "home-title" : "main-content"), path);
  }
  for (const page of manifest.pages.filter((page) => /(?:quickstart|manage|configuration)$/.test(page.url))) {
    const response = await get(page.markdown);
    assert.equal(response.status, 200, page.markdown);
    assert.equal(createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex"), page.revision, page.id);
  }
  const indexResponse = await get("/_lenso/search/zh.json");
  assert.equal(indexResponse.status, 200);
  const database = create({ schema: { _: "string" }, components: { tokenizer: createChineseTokenizer() } });
  load(database, await indexResponse.json());
  for (const [term, slug] of [["配置", "configuration"], ["数据库", "database"], ["管理", "manage"]]) {
    const result = await search(database, { term, properties: ["content"], limit: 100 });
    assert.ok(result.hits.some((hit) => hit.document.url.startsWith(`/docs/zh/${slug}`)), term);
  }
  const old = await get("/docs/core/quickstart", { redirect: "manual" });
  assert.ok([301, 308].includes(old.status), "legacy redirect must be permanent");
  assert.equal(new URL(old.headers.get("location"), base).pathname.replace(/\/$/, ""), "/docs/upgrade");
  for (const path of ["/this-page-does-not-exist/", "/plugins/"]) assert.equal((await get(path)).status, 404, path);
  const homepage = await (await get("/")).text();
  const asset = homepage.match(/src="([^" ]+\/_next\/[^" ]+\.js(?:\?[^" ]*)?)"/)?.[1]
    ?? homepage.match(/src="(\/_next\/[^" ]+\.js(?:\?[^" ]*)?)"/)?.[1];
  assert.ok(asset, "homepage must reference a compiled client asset");
  assert.equal((await get(asset.replaceAll("&amp;", "&"))).status, 200, asset);
  assert.equal((await get("/lenso-assets/lenso-header-mark.svg")).status, 200);
  console.log("Site integration: exact Docs 0.1.0, exported HTML/Markdown, Chinese search, assets, permanent legacy redirect, inactive Marketplace and HTTP 404 passed.");
} finally {
  if (!exited) {
    child.kill("SIGTERM");
    await Promise.race([new Promise((done) => child.once("exit", done)), delay(3000)]);
    if (!exited) child.kill("SIGKILL");
  }
}
