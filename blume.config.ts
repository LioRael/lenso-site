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
