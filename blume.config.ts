import { defineConfig } from "blume";

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
    sidebar: {
      display: "group",
    },
  },
  search: {
    provider: "orama",
  },
  ai: {
    llmsTxt: {
      enabled: true,
      openapi: true,
    },
    openInChat: ["claude", "chatgpt", "cursor"],
    mcp: {
      enabled: true,
      route: "/mcp",
      name: "Lenso Documentation",
      instructions:
        "Use the task-oriented Start, Build, and Operate pages first. Treat Implementation status as the authority for current support, and use Concepts or Reference only when the task crosses that boundary. Answer in the reader's language and cite the pages used.",
    },
    webmcp: true,
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
    agentReadability: true,
    contentSignals: {
      search: true,
      aiInput: true,
      aiTrain: true,
    },
    og: { enabled: true },
    rss: { enabled: false },
    sitemap: true,
    robots: true,
    structuredData: true,
  },
  deployment: {
    output: "server",
    adapter: "cloudflare",
    site: "https://lenso.dev",
  },
  basePath: "/docs",
});
