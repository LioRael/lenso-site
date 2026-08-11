import { defineConfig } from "blume";

export default defineConfig({
  title: "Lenso",
  description:
    "Compose, run locally, connect, and read status for agent-ready Rust modular applications and microservices.",
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
    repo: "lenso",
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
    tabs: [
      { label: "Documentation", path: "/" },
      { label: "API reference", path: "/api" },
    ],
  },
  search: {
    provider: "orama",
  },
  ai: {
    llmsTxt: true,
    mcp: {
      enabled: false,
    },
  },
  openapi: {
    enabled: true,
    route: "/api",
    sources: [
      {
        label: "API Reference",
        route: "/api",
        spec: "./openapi/app-api.v1.yaml",
      },
      {
        label: "API 参考",
        route: "/zh/api",
        spec: "./openapi/app-api.zh.v1.yaml",
      },
    ],
    codeSamples: ["curl", "js", "python"],
    expandSchemas: false,
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
