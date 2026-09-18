import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDraftDocument, routeForDocument, walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = join(root, "content/docs");
const outputRoot = process.env.BLUME_OUTPUT_ROOT
  ? resolve(root, process.env.BLUME_OUTPUT_ROOT)
  : join(root, "dist");
const failures = [];

const siteOrigin = "https://lenso.dev";

function output(file) {
  const absolute = join(outputRoot, file);
  if (!existsSync(absolute)) {
    failures.push(`dist/${file}: missing`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function advertisedPageUrls(text) {
  const urls = new Set();
  const urlPattern = /https:\/\/lenso\.dev\/docs[^\s)>'"]*/g;
  for (const match of text.matchAll(urlPattern)) {
    const value = match[0].replace(/[.,;:]+$/u, "");
    try {
      const parsed = new URL(value);
      if (parsed.origin === siteOrigin && parsed.pathname.startsWith("/docs")) {
        urls.add(parsed.toString());
      }
    } catch {
      failures.push(`catalog: invalid advertised page URL ${JSON.stringify(value)}`);
    }
  }
  return urls;
}

function checkAdvertisedEndpoints(catalog, text) {
  const linkPattern = /\]\((https?:\/\/[^\s)]+)|href=["'](https?:\/\/[^"']+)|^Source:\s*(https?:\/\/\S+)/gim;
  for (const match of text.matchAll(linkPattern)) {
    const value = match[1] ?? match[2] ?? match[3];
    try {
      const parsed = new URL(value);
      if (/(?:^|\/)(?:mcp|webmcp)(?:\/|$)|ai\.(?:mcp|webmcp)|\.well-known\//iu.test(parsed.pathname)) {
        failures.push(`dist/${catalog}: MCP endpoint is advertised at ${value}`);
      }
    } catch {
      failures.push(`dist/${catalog}: invalid advertised URL ${JSON.stringify(value)}`);
    }
  }
}

function routeForAdvertisedUrl(value) {
  const parsed = new URL(value);
  const path = parsed.pathname.replace(/\/+$/u, "") || "/";
  return path === "/docs" ? "/docs" : path;
}

function checkAgentCatalogs() {
  const llms = output("llms.txt");
  const llmsFull = output("llms-full.txt");
  const readabilityText = output("agent-readability.json");
  if (!llms || !llmsFull || !readabilityText) return;

  let readability;
  try {
    readability = JSON.parse(readabilityText);
  } catch {
    failures.push("dist/agent-readability.json: invalid JSON");
    return;
  }
  const advertised = new Map([
    ["llms.txt", advertisedPageUrls(llms)],
    ["llms-full.txt", advertisedPageUrls(llmsFull)],
  ]);
  checkAdvertisedEndpoints("llms.txt", llms);
  checkAdvertisedEndpoints("llms-full.txt", llmsFull);
  const allRoutes = new Set();
  for (const [catalog, urls] of advertised) {
    if (urls.size === 0) failures.push(`dist/${catalog}: no advertised documentation pages`);
    for (const url of urls) {
      const route = routeForAdvertisedUrl(url);
      allRoutes.add(route);
      const markdown = `${route.slice(1)}.md`;
      if (!existsSync(join(outputRoot, markdown))) {
        failures.push(`dist/${catalog}: advertised ${url} has no Markdown target dist/${markdown}`);
      }
      if (/(?:^|\/)(?:mcp|webmcp)(?:\/|$)|ai\.(?:mcp|webmcp)|\.well-known\//iu.test(url)) {
        failures.push(`dist/${catalog}: MCP endpoint is advertised at ${url}`);
      }
    }
  }

  const english = new Set();
  const chinese = new Set();
  for (const route of allRoutes) {
    const family = route.startsWith("/docs/zh") ? chinese : english;
    family.add(route.replace(/^\/docs\/zh(?=\/|$)/u, "/docs"));
  }
  if (english.size === 0 || chinese.size === 0) {
    failures.push("catalogs: both English and Simplified Chinese page families must be advertised");
  }
  const missingChinese = [...english].filter((route) => !chinese.has(route));
  const missingEnglish = [...chinese].filter((route) => !english.has(route));
  for (const route of missingChinese) failures.push(`catalogs: missing Chinese counterpart for ${route}`);
  for (const route of missingEnglish) failures.push(`catalogs: missing English counterpart for ${route}`);

  const sourceByRoute = new Map();
  for (const file of walkFiles(docsRoot).filter((candidate) => candidate.endsWith(".mdx"))) {
    sourceByRoute.set(routeForDocument(docsRoot, file), file);
  }
  const liveRoutes = new Set(
    [...sourceByRoute].filter(([, source]) => !isDraftDocument(source)).map(([route]) => route),
  );
  for (const [catalog, urls] of advertised) {
    const routes = new Set([...urls].map(routeForAdvertisedUrl));
    for (const route of liveRoutes) {
      if (!routes.has(route)) failures.push(`dist/${catalog}: live page ${route} is missing from the catalog`);
    }
  }
  for (const route of allRoutes) {
    const source = sourceByRoute.get(route);
    if (!source) {
      failures.push(`catalogs: advertised ${route} has no source document`);
    } else if (isDraftDocument(source)) {
      failures.push(`catalogs: advertised ${route} is sourced from draft ${relative(root, source)}`);
    }
  }

  const artifacts = readability.artifacts ?? {};
  const markdownPattern = artifacts.markdown?.pattern;
  if (typeof markdownPattern !== "string" || !markdownPattern.includes("{route}")) {
    failures.push("dist/agent-readability.json: markdown artifact pattern must contain {route}");
  } else {
    for (const route of allRoutes) {
      const markdownUrl = markdownPattern.replace("{route}", route.slice(1));
      try {
        const parsed = new URL(markdownUrl);
        if (parsed.origin !== siteOrigin || parsed.pathname !== `${route}.md`) {
          failures.push(`dist/agent-readability.json: ${route} resolves to unexpected Markdown URL ${markdownUrl}`);
        }
      } catch {
        failures.push(`dist/agent-readability.json: invalid Markdown URL ${markdownUrl}`);
      }
    }
  }
  for (const key of ["llmsTxt", "llmsFullTxt"]) {
    const value = artifacts[key];
    if (value !== `${siteOrigin}/${key === "llmsTxt" ? "llms.txt" : "llms-full.txt"}`) {
      failures.push(`dist/agent-readability.json: ${key} does not point at the generated catalog`);
    }
  }
  const serialized = JSON.stringify(readability);
  if (/(?:^|\/)(?:mcp|webmcp)(?:\/|$)|ai\.(?:mcp|webmcp)|\.well-known\//iu.test(serialized)) {
    failures.push("dist/agent-readability.json: MCP endpoint is advertised");
  }
}

if (!existsSync(outputRoot)) throw new Error("dist is missing; run this check after blume build");

if (existsSync(join(outputRoot, "index.html"))) {
  failures.push("dist/index.html: standalone homepage must not be published");
}

for (const file of ["blume-search.json", "llms.txt", "llms-full.txt", "sitemap.xml"]) {
  if (!existsSync(join(outputRoot, file))) failures.push(`dist/${file}: missing`);
}

checkAgentCatalogs();

const smokePages = [
  ["docs/index.html", ["Lenso documentation", "What do you want to build?", "Learn the core framework"]],
  ["docs/core/index.html", ["Core framework", "Why Lenso exists", "Resolved App Plan"]],
  ["docs/core/quickstart/index.html", ["Create and exercise a Plugin", "Connect the Bundle to an App"]],
  ["docs/core/first-app-change/index.html", ["Change your first App", "Initialize the App workspace", "Run the current Host"]],
  ["docs/core/inspect-an-app/index.html", ["Inspect and troubleshoot an App", "lenso doctor", "lenso app show"]],
  ["docs/web/index.html", ["Build a Web backend", "Current authoring boundary", "Definition of done"]],
  ["docs/web/protect-an-endpoint/index.html", ["Protect an Endpoint", "Authenticate", "Authorize"]],
  ["docs/web/deployment-boundary/index.html", ["Prepare a Web Host for deployment", "TLS", "Deployment checklist"]],
  ["docs/agent/index.html", ["Build an Agent product with Lenso", "Choose the smallest change", "Add one Tool"]],
  ["docs/agent/subagents/index.html", ["Delegate to child Agents", "list_subagents", "integrate_worktree"]],
  ["docs/agent/mcp-servers/index.html", ["Connect an MCP server", "streamable_http", "Context Source"]],
  ["docs/zh/index.html", ["Lenso 文档", "你想构建什么？", "学习核心框架"]],
  ["docs/zh/core/index.html", ["核心框架", "为什么需要 Lenso", "可移植 Kernel"]],
  ["docs/zh/core/first-app-change/index.html", ["修改第一个 App", "初始化 App Workspace", "运行当前 Host"]],
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
