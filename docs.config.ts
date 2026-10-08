import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "Lenso",
  description: "A Bun-first TypeScript framework for applications composed from ordinary async services and replaceable plugins.",
  logo: "/lenso-assets/lenso-header-mark.svg",
  siteUrl: "https://lenso.dev",
  source: "docs.source.mjs",
  components: "docs.components.tsx",
  styles: ["components/site.css", "routes/home.css"],
  trailingSlash: true,
  defaultLocale: "en",
  locales: [
    { code: "en", label: "English", language: "en", routePrefix: "/docs" },
    { code: "zh", label: "中文", language: "zh-CN", routePrefix: "/docs/zh" },
  ],
  links: { GitHub: "https://github.com/LioRael/lenso" },
});
