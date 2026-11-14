import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "Lenso",
  description: "Documentation for Lenso, including CLI and Docs.",
  language: "en",
  defaultLocale: "en",
  locales: [
    { code: "en", label: "English", language: "en", routePrefix: "/", contentDir: "content-en" },
    { code: "zh", label: "中文", language: "zh-CN", routePrefix: "/zh", contentDir: "content" },
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
