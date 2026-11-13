import { BookOpen, Terminal } from "@gravity-ui/icons";
import type { DocumentationCustomizationContext } from "@lenso/docs/react";

const topics = {
  cli: {
    title: "Lenso CLI",
    icon: <Terminal width={16} height={16} aria-hidden="true" />,
    pages: [
      ["", "Lenso CLI", "Lenso CLI"],
      ["installation", "安装", "Installation"],
      ["quickstart", "快速开始", "Quickstart"],
      ["extensions", "扩展与预设", "Extensions and presets"],
      ["code", "Code 扩展", "Code extension"],
      ["shadcn", "shadcn 扩展", "shadcn extension"],
      ["configuration", "配置、锁文件与缓存", "Configuration, lockfile, and cache"],
      ["automation", "自动化与 JSON", "Automation and JSON"],
      ["authoring", "开发与发布扩展", "Developing and publishing extensions"],
      ["embedding", "嵌入 Rust CLI", "Embedding in a Rust CLI"],
    ],
  },
  docs: {
    title: "Lenso Docs",
    icon: <BookOpen width={16} height={16} aria-hidden="true" />,
    pages: [
      ["", "Lenso Docs", "Lenso Docs"],
      ["quickstart", "快速开始", "Quickstart"],
      ["content", "编写内容", "Writing content"],
      ["configuration", "站点配置", "Site configuration"],
      ["customization", "界面定制", "Customization"],
      ["deployment", "构建与部署", "Build and deployment"],
    ],
  },
} as const;

export function getSiteOptions({ page }: DocumentationCustomizationContext) {
  const english = page.locale === "en";
  const prefix = english ? "/en" : "";
  const activeSection = page.slug === "docs" || page.slug.startsWith("docs/") ? "docs" : "cli";
  const topic = topics[activeSection];
  return {
    brand: { title: "Lenso", url: `${prefix}/` },
    activeSection,
    sections: Object.entries(topics).map(([id, section]) => ({
      id,
      title: section.title,
      url: `${prefix}/${id}/`,
      icon: section.icon,
    })),
    navigation: [
      { title: topic.title },
      ...topic.pages.map(([slug, chinese, englishTitle]) => ({
        title: english ? englishTitle : chinese,
        url: `${prefix}/${activeSection}/${slug ? `${slug}/` : ""}`,
      })),
    ],
    slots: { drawerFooter: null },
  };
}
