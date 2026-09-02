import { defineConfig } from "blume";

const movedDocumentRoutes = [
  ["/quickstart", "/core/quickstart"],
  ["/agent-skills", "/core/agent-skills"],
  ["/plugins-and-capabilities", "/core/plugins-and-capabilities"],
  ["/choose-plugin-path", "/core/choose-plugin-path"],
  ["/plugin-authoring", "/core/plugin-authoring"],
  ["/linked-rust-plugin", "/core/linked-rust-plugin"],
  ["/bun-plugin-authoring", "/core/bun-plugin-authoring"],
  ["/plugin-configuration", "/core/plugin-configuration"],
  ["/plugin-composition", "/core/plugin-composition"],
  ["/capability-authoring", "/core/capability-authoring"],
  ["/architecture", "/core/architecture"],
  ["/project-and-plan", "/core/project-and-plan"],
  ["/runtime-lifecycle", "/core/runtime-lifecycle"],
  ["/execution-adapters", "/core/execution-adapters"],
  ["/secrets-plugin", "/core/secrets-plugin"],
  ["/postgres-kit", "/core/postgres-kit"],
  ["/web-and-observability", "/core/web-and-observability"],
  ["/repository-map", "/core/repository-map"],
  ["/status-and-scope", "/core/supported-workflows"],
  ["/core/status-and-scope", "/core/supported-workflows"],
  ["/architecture-decisions", "/core/architecture-decisions"],
  ["/web-backend", "/web"],
  ["/web-endpoint-plugin", "/web/web-endpoint-plugin"],
  ["/web-host-integration", "/web/web-host-integration"],
  ["/web-testing", "/web/web-testing"],
  ["/web-capabilities", "/web/web-capabilities"],
  ["/auth-plugin", "/web/auth-plugin"],
  ["/agent-development", "/agent"],
  ["/first-app", "/agent/first-app"],
  ["/agent-configuration", "/agent/agent-configuration"],
] as const;

const redirects = movedDocumentRoutes.flatMap(([from, to]) => [
  { from, to },
  { from: `/zh${from}`, to: `/zh${to}` },
]);

export default defineConfig({
  title: "Lenso",
  description:
    "Documentation for the Lenso local-first, language-independent modular application runtime.",
  logo: {
    text: "Lenso",
    href: "/",
  },
  content: {
    root: "content/docs",
    pages: "pages",
  },
  github: {
    owner: "LioRael",
    repo: "lenso-site",
    branch: "main",
  },
  lastModified: true,
  i18n: {
    defaultLocale: "en",
    fallbackLocale: "en",
    hideDefaultLocalePrefix: true,
    parser: "dir",
    locales: [
      { code: "en", label: "English" },
      { code: "zh", label: "简体中文" },
    ],
  },
  navigation: {
    tabs: [
      { label: { en: "Framework", zh: "核心框架" }, path: "/core" },
      { label: { en: "Web", zh: "Web" }, path: "/web" },
      { label: { en: "Agent", zh: "Agent" }, path: "/agent" },
    ],
    sidebar: {
      display: "group",
    },
  },
  redirects,
  search: {
    provider: "orama",
  },
  ai: {
    llmsTxt: true,
    mcp: {
      enabled: false,
    },
  },
  markdown: {
    imageZoom: true,
    code: {
      icons: true,
      wrap: false,
    },
    codeBlocks: {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
  seo: {
    og: { enabled: true },
    rss: { enabled: false },
    sitemap: true,
    robots: true,
    structuredData: true,
  },
  deployment: {
    output: "static",
    site: "https://lenso.dev",
  },
  basePath: "/docs",
});
