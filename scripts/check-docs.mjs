import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDraftDocument, routeForDocument, walkFiles } from "./docs-files.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const curatedProductFiles = [
  "blume.config.ts",
  "pages/index.astro",
  "islands/HomePage.tsx",
  "components/home/HeroCommandTabs.tsx",
  "content/docs/meta.ts",
  "content/docs/zh/meta.ts",
  "content/docs/(host)/meta.ts",
  "content/docs/zh/(host)/meta.ts",
  "content/docs/(concepts)/meta.ts",
  "content/docs/zh/(concepts)/meta.ts",
  "content/docs/index.mdx",
  "content/docs/zh/index.mdx",
  "content/docs/(host)/quickstart.mdx",
  "content/docs/zh/(host)/quickstart.mdx",
  "content/docs/(host)/product-blueprints.mdx",
  "content/docs/zh/(host)/product-blueprints.mdx",
  "content/docs/(host)/runtime-console.mdx",
  "content/docs/zh/(host)/runtime-console.mdx",
  "content/docs/(host)/cli-reference.mdx",
  "content/docs/zh/(host)/cli-reference.mdx",
  "content/docs/(host)/troubleshooting.mdx",
  "content/docs/zh/(host)/troubleshooting.mdx",
  "content/docs/(module)/examples.mdx",
  "content/docs/zh/(module)/examples.mdx",
  "content/docs/(concepts)/autonomous-services.mdx",
  "content/docs/zh/(concepts)/autonomous-services.mdx",
  "content/docs/(concepts)/platform-concepts.mdx",
  "content/docs/zh/(concepts)/platform-concepts.mdx",
  "content/docs/(concepts)/runtime-stories.mdx",
  "content/docs/zh/(concepts)/runtime-stories.mdx",
  "content/docs/(concepts)/service-system-plane.mdx",
  "content/docs/zh/(concepts)/service-system-plane.mdx",
  "content/docs/(concepts)/manifest-reference.mdx",
  "content/docs/zh/(concepts)/manifest-reference.mdx",
  "content/docs/(concepts)/contracts-and-checks.mdx",
  "content/docs/zh/(concepts)/contracts-and-checks.mdx",
  "content/docs/(module)/console-packages.mdx",
  "content/docs/zh/(module)/console-packages.mdx",
  "content/docs/(module)/module-authoring.mdx",
  "content/docs/zh/(module)/module-authoring.mdx",
  "content/docs/(module)/runtime-lifecycle.mdx",
  "content/docs/zh/(module)/runtime-lifecycle.mdx",
  "content/docs/(module)/admin-surfaces.mdx",
  "content/docs/zh/(module)/admin-surfaces.mdx",
  "content/docs/(module)/auth-capabilities.mdx",
  "content/docs/zh/(module)/auth-capabilities.mdx",
  "content/docs/(agent)/agent-development.mdx",
  "content/docs/zh/(agent)/agent-development.mdx",
];

const retiredProductVocabulary = [
  ["retired product vocabulary", /\b(?:proof|evidence|readiness|degradation|launchpad)\b/gi],
  ["retired change-plan vocabulary", /\bchange plan\b/gi],
  ["retired Plan/Apply lifecycle", /\bplan\s*\/\s*apply\b/gi],
  ["retired System v1 product model", /\blenso\.system(?:\.v1|\.json)\b/gi],
  [
    "retired System management entrypoint",
    /\blenso system (?:init|add-service|add-module|graph|plan|diff|apply|release|runbook|doctor)\b/gi,
  ],
  ["retired environment selection entrypoint", /(?:^|\s)--env(?:\s|=)/g],
];

const retiredContractVocabulary = [
  ["retired Console transport", /console[-_ ]bridge/gi],
  ["retired isolated UI format", /isolated_web/gi],
  ["retired generic administration path", /admin[ _-](?:data|action)/gi],
  ["retired Data workspace", /\bdata workspace\b/gi],
  ["retired generic operation", /\bgeneric (?:query|command)\b/gi],
  ["retired host administration route", /\/admin\/(?:data|actions?)(?:\/|\b)/gi],
  ["retired administration builder", /\b(?:AdminSchema|EntitySchema)\b|\.admin\s*\(/g],
  [
    "retired administration declaration",
    /\b(?:declarative_admin|embedded_admin|data-admin|admin\.(?:schema|declarative|embedded))\b/gi,
  ],
  ["retired administration wording", /\b(?:admin schemas?|declarative actions?)\b/gi],
  [
    "retired Chinese administration wording",
    /管理数据\s*API|管理模式|数据管理实体|数据显示声明的模式管理界面/g,
  ],
];

const failures = [];

function fileText(file) {
  const absolute = join(root, file);
  if (!existsSync(absolute)) {
    failures.push(`${file}: curated document is missing`);
    return "";
  }
  return readFileSync(absolute, "utf8");
}

function lineNumber(text, index) {
  return text.slice(0, index).split("\n").length;
}

function checkVocabulary(files, rules) {
  for (const file of files) {
    const text = fileText(file);
    for (const [label, expression] of rules) {
      expression.lastIndex = 0;
      for (const match of text.matchAll(expression)) {
        failures.push(
          `${file}:${lineNumber(text, match.index ?? 0)}: ${label}: ${JSON.stringify(match[0])}`,
        );
      }
    }
  }
}

for (const file of curatedProductFiles) {
  const text = fileText(file);
  for (const expression of [
    /\/lenso-assets\/lifecycle-[^"']+/g,
    /\/lenso-assets\/console\/app-lifecycle\.png/g,
  ]) {
    for (const match of text.matchAll(expression)) {
      failures.push(
        `${file}:${lineNumber(text, match.index ?? 0)}: obsolete lifecycle asset: ${match[0]}`,
      );
    }
  }
}

function assertOrdered(file, snippets) {
  const text = fileText(file);
  let cursor = -1;
  for (const snippet of snippets) {
    const index = text.indexOf(snippet, cursor + 1);
    if (index === -1) {
      failures.push(`${file}: missing lifecycle marker ${JSON.stringify(snippet)}`);
      continue;
    }
    cursor = index;
  }
}

function assertIncludes(files, label, snippets) {
  for (const file of files) {
    const text = fileText(file);
    for (const snippet of snippets) {
      if (!text.includes(snippet)) {
        failures.push(`${file}: missing ${label} ${JSON.stringify(snippet)}`);
      }
    }
  }
}

function rustInitializerBlocks(text, typeName) {
  const blocks = [];
  const starts = new RegExp(`\\b${typeName}\\s*\\{`, "g");
  for (const match of text.matchAll(starts)) {
    const start = match.index ?? 0;
    const openingBrace = text.indexOf("{", start);
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = openingBrace; index < text.length; index += 1) {
      const character = text[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') quoted = false;
        continue;
      }
      if (character === '"') quoted = true;
      else if (character === "{") depth += 1;
      else if (character === "}") {
        depth -= 1;
        if (depth === 0) {
          blocks.push({ start, text: text.slice(start, index + 1) });
          break;
        }
      }
    }
  }
  return blocks;
}

function assertRustInitializerFields(files, requirements) {
  for (const file of files) {
    const text = fileText(file);
    for (const [typeName, fields] of requirements) {
      for (const block of rustInitializerBlocks(text, typeName)) {
        for (const field of fields) {
          if (!new RegExp(`\\b${field}\\s*:`).test(block.text)) {
            failures.push(
              `${file}:${lineNumber(text, block.start)}: ${typeName} initializer is missing ${field}`,
            );
          }
        }
      }
    }
  }
}

assertOrdered("islands/HomePage.tsx", [
  "title: 'Compose'",
  "title: 'Run locally'",
  "title: 'Connect'",
  "title: 'Status'",
]);
assertOrdered("content/docs/index.mdx", [
  "## Compose",
  "## Run locally",
  "## Connect",
  "## Status",
]);
assertOrdered("content/docs/zh/index.mdx", [
  "## Compose（组合）",
  "## Run locally（本地运行）",
  "## Connect（连接）",
  "## Status（状态）",
]);
assertOrdered("content/docs/(host)/quickstart.mdx", [
  "## 1. Compose",
  "## 2. Run locally",
  "## 3. Connect",
  "## 4. Status",
]);
assertOrdered("content/docs/zh/(host)/quickstart.mdx", [
  "## 1. Compose（组合）",
  "## 2. Run locally（本地运行）",
  "## 3. Connect（连接）",
  "## 4. Status（状态）",
]);
assertOrdered("content/docs/(host)/cli-reference.mdx", [
  "## Compose",
  "## Run locally",
  "## Connect",
  "## Status",
]);
assertOrdered("content/docs/zh/(host)/cli-reference.mdx", [
  "## Compose（组合）",
  "## Run locally（本地运行）",
  "## Connect（连接）",
  "## Status（状态）",
]);
assertOrdered("content/docs/(host)/troubleshooting.mdx", [
  "## Compose",
  "## Run locally",
  "## Connect",
  "## Status",
]);
assertOrdered("content/docs/zh/(host)/troubleshooting.mdx", [
  "## Compose（组合）",
  "## Run locally（本地运行）",
  "## Connect（连接）",
  "## Status（状态）",
]);
assertOrdered("content/docs/(module)/examples.mdx", [
  "### Compose",
  "### Run locally",
  "### Connect",
  "### Status",
]);
assertOrdered("content/docs/zh/(module)/examples.mdx", [
  "### Compose（组合）",
  "### Run locally（本地运行）",
  "### Connect（连接）",
  "### Status（状态）",
]);
assertOrdered("content/docs/(concepts)/platform-concepts.mdx", [
  "**Compose**",
  "**Run locally**",
  "**Connect**",
  "**Status**",
]);
assertOrdered("content/docs/zh/(concepts)/platform-concepts.mdx", [
  "**Compose（组合）**",
  "**Run locally（本地运行）**",
  "**Connect（连接）**",
  "**Status（状态）**",
]);
assertOrdered("content/docs/(concepts)/service-system-plane.mdx", [
  "### Compose",
  "### Run locally",
  "### Connect",
  "### Status",
]);
assertOrdered("content/docs/zh/(concepts)/service-system-plane.mdx", [
  "### Compose（组合）",
  "### Run locally（本地运行）",
  "### Connect（连接）",
  "### Status（状态）",
]);

assertIncludes(
  [
    "content/docs/(concepts)/autonomous-services.mdx",
    "content/docs/zh/(concepts)/autonomous-services.mdx",
  ],
  "capability-tier statement",
  [
    "Service Capability Tiers",
    "Provider tier",
    "Autonomous Service tier",
    "lenso.service.v1",
    "lenso.service.v2",
    "direct HTTP/gRPC",
    "events",
    "workflows",
    "identity",
    "delegated context",
    "service-owned storage",
    "TypeScript does not provide Autonomous Service parity",
  ],
);

assertIncludes(
  [
    "content/docs/(module)/module-authoring.mdx",
    "content/docs/zh/(module)/module-authoring.mdx",
  ],
  "Support Ticket identity",
  [
    'ModuleManifest::builder("support/tickets")',
    '"support.tickets.read"',
    '"support.tickets.write"',
    "cargo add lenso --features host",
    "lenso module create billing",
  ],
);

assertIncludes(
  [
    "content/docs/(module)/auth-capabilities.mdx",
    "content/docs/zh/(module)/auth-capabilities.mdx",
  ],
  "Support Ticket capability identity",
  [
    'ModuleManifest::builder("support/tickets")',
    "cargo add lenso --features host",
  ],
);

assertIncludes(
  ["islands/HomePage.tsx"],
  "Support Desk product identities",
  ["surface: support-tickets", "service: support-suite-provider"],
);

assertIncludes(
  [
    "content/docs/(module)/console-packages.mdx",
    "content/docs/zh/(module)/console-packages.mdx",
  ],
  "Console manifest boundary",
  [
    "ModuleManifest.console",
    "ConsoleSurface",
    "ConsoleModuleManifest.surfaces",
    "ConsoleModuleSurface.area",
    "ModuleManifest.console_slots",
    "ModuleManifest.console_contributions",
  ],
);

assertIncludes(
  ["content/docs/(module)/examples.mdx"],
  "acceptance prerequisite",
  ["Cargo is always required"],
);
assertIncludes(
  ["content/docs/zh/(module)/examples.mdx"],
  "acceptance prerequisite",
  ["`Cargo` 始终是必需的"],
);

assertIncludes(
  [
    "content/docs/(host)/product-blueprints.mdx",
    "content/docs/zh/(host)/product-blueprints.mdx",
  ],
  "product acceptance statement",
  [
    "--pack ./fixtures/acceptance/support-desk/capability",
    "--implementation support-api=linked",
    "--implementation notification-worker=linked",
    "--implementation lenso/platform-story=linked",
    "lenso service workspace init --force",
    "lenso service workspace add support-ticket",
    "pnpm acceptance:support-desk",
  ],
);

assertIncludes(
  [
    "content/docs/(module)/examples.mdx",
    "content/docs/zh/(module)/examples.mdx",
  ],
  "acceptance runner statement",
  [
    "pnpm acceptance:support-desk",
    "lenso service workspace init --force",
    "lenso service workspace add support-ticket",
    "lenso.service.json",
    "LENSO_ACCEPTANCE_DATABASE_URL",
  ],
);

assertIncludes(
  [
    "content/docs/(host)/runtime-console.mdx",
    "content/docs/zh/(host)/runtime-console.mdx",
  ],
  "local enrollment boundary",
  [
    "POST /api/console/v1/enrollment-receipts",
    "{offer, receipt, baseUrl}",
    "console.system.connect",
    "lenso-local-control-adapter",
    "workload-control:<system>",
    "loopback",
    "mTLS",
  ],
);

const docsRoot = join(root, "content/docs");
const documentationFiles = walkFiles(docsRoot)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => relative(root, file));
const draftDocumentationFiles = documentationFiles.filter((file) =>
  isDraftDocument(join(root, file)),
);
const draftDocumentationSet = new Set(draftDocumentationFiles);
const publishedDocumentationFiles = documentationFiles.filter(
  (file) => !draftDocumentationSet.has(file),
);
assertRustInitializerFields(publishedDocumentationFiles, [
  ["ModuleHttpRoute", ["operation"]],
  ["RuntimeSurface", ["workflows"]],
  ["RuntimeFunctionDeclaration", ["operation"]],
]);
for (const file of publishedDocumentationFiles) {
  const text = fileText(file);
  for (const match of text.matchAll(/ModuleManifest::builder\("([^"]+)"\)/g)) {
    if (!match[1].includes("/")) {
      failures.push(
        `${file}:${lineNumber(text, match.index ?? 0)}: Module identity must be fully qualified: ${JSON.stringify(match[0])}`,
      );
    }
  }
  for (const expression of [
    /ModuleManifest::builder\("support-ticket"\)/g,
    /"support\.ticket\.(?:read|write)"/g,
    /\blenso module create support-ticket\b/g,
    /\bModuleSource\b/g,
    /lint_module_manifest\([^)]*,/g,
    /\.dependencies\(/g,
  ]) {
    for (const match of text.matchAll(expression)) {
      failures.push(
        `${file}:${lineNumber(text, match.index ?? 0)}: Support Ticket identity drift: ${JSON.stringify(match[0])}`,
      );
    }
  }
}
for (const file of curatedProductFiles.filter((file) => file.endsWith(".mdx"))) {
  if (draftDocumentationSet.has(file)) {
    failures.push(`${file}: curated product document must remain published`);
  }
}
const publishedSurfaceFiles = [
  ...publishedDocumentationFiles,
  ...walkFiles(docsRoot)
    .filter((file) => file.endsWith("meta.ts"))
    .map((file) => relative(root, file)),
  "blume.config.ts",
  "pages/index.astro",
  "islands/HomePage.tsx",
  "components/home/HeroCommandTabs.tsx",
];
checkVocabulary(publishedSurfaceFiles, retiredProductVocabulary);
checkVocabulary(publishedSurfaceFiles, retiredContractVocabulary);

const validRoutes = new Set(["/", "/docs", "/docs/api", "/docs/zh", "/docs/zh/api"]);
for (const file of publishedDocumentationFiles) {
  validRoutes.add(routeForDocument(docsRoot, join(root, file)));
}

function checkLocalTarget(file, target, line) {
  const withoutQuery = target.split("?")[0];
  if (withoutQuery.startsWith("/docs")) {
    if (!validRoutes.has(withoutQuery)) {
      failures.push(`${file}:${line}: local documentation link does not resolve: ${target}`);
    }
    return;
  }
  if (withoutQuery.startsWith("/lenso-assets/")) {
    if (!existsSync(join(root, "public", withoutQuery.slice(1)))) {
      failures.push(`${file}:${line}: local asset does not exist: ${target}`);
    }
  }
}

for (const file of publishedSurfaceFiles) {
  const text = fileText(file);
  for (const expression of [
    /\]\((\/[^\s)#]+)(?:#[^)]+)?\)/g,
    /href=["'](\/[^"'#]+)(?:#[^"']*)?["']/g,
    /["'](\/lenso-assets\/[^"']+)["']/g,
  ]) {
    for (const match of text.matchAll(expression)) {
      checkLocalTarget(file, match[1], lineNumber(text, match.index ?? 0));
    }
  }
}

if (failures.length > 0) {
  console.error(`Documentation checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Documentation checks passed for ${curatedProductFiles.length} curated files, ${publishedDocumentationFiles.length} published docs, and ${draftDocumentationFiles.length} production-excluded drafts.`,
);
