import { defineConfig } from "blume";

export default defineConfig({
  title: "Lenso",
  description:
    "Build agent-ready Rust business systems as explicit modules, then split stable boundaries into services.",
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
  theme: {
    accent: "blue",
    radius: "sm",
    mode: "system",
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
    spec: "./openapi/app-api.v1.yaml",
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
