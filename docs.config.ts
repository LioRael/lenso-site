import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "Lenso",
  description: "Lenso 项目文档，包括 CLI 与 Docs。",
  language: "zh-CN",
  defaultLocale: "zh",
  locales: [
    { code: "zh", label: "中文", language: "zh-CN", routePrefix: "/", contentDir: "content" },
    { code: "en", label: "English", language: "en", routePrefix: "/en", contentDir: "content-en" },
  ],
  components: "docs-components.tsx",
  styles: ["docs.css"],
  links: { GitHub: "https://github.com/LioRael/lenso" },
  navigation: [
    { title: "Lenso", pages: ["index"] },
    {
      title: "Lenso CLI",
      pages: [
        "cli/index",
        "cli/installation",
        "cli/quickstart",
        "cli/extensions",
        "cli/code",
        "cli/shadcn",
        "cli/configuration",
        "cli/automation",
        "cli/authoring",
        "cli/embedding",
      ],
    },
    {
      title: "Lenso Docs",
      pages: [
        "docs/index",
        "docs/quickstart",
        "docs/content",
        "docs/configuration",
        "docs/customization",
        "docs/deployment",
      ],
    },
  ],
});
