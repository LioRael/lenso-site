import type { DocumentationCustomizationContext, DocumentationRootContext } from "@lenso/docs/react";
import { SiteControls } from "./components/site-controls";
import { SiteSearch } from "./components/site-search";

const ref = "6e239c71a38279885facce133ceb847bbfe12f2f";

export function getRootOptions({ locale }: DocumentationRootContext) {
  return { skipLabel: locale.code === "zh" ? "跳到正文" : "Skip to content", metadata: { icons: { icon: "/lenso-assets/lenso-header-mark.svg" } } };
}

export function getSiteOptions({ page }: DocumentationCustomizationContext) {
  const zh = page.locale === "zh";
  const base = zh ? "/docs/zh" : "/docs";
  const slug = page.id.split("/").slice(1).join("/");
  const controls = <SiteControls locale={page.locale} alternate={`${zh ? "/docs" : "/docs/zh"}/${slug}/`} />;
  return {
    brand: { title: "Lenso", url: zh ? "/zh/" : "/", docsUrl: `${base}/introduction/`, logo: <img src="/lenso-assets/lenso-header-mark.svg" alt="" width="25" height="25" /> },
    sections: [{ id: "docs", title: zh ? "文档" : "Documentation", url: `${base}/introduction/` }, { id: "api", title: zh ? "API 索引" : "API index", url: `${base}/api/` }],
    activeSection: slug === "api" ? "api" : "docs",
    navigationStateKey: `${page.locale}:typescript`,
    slots: { search: <SiteSearch locale={page.locale} from={`/_lenso/search/${page.locale}.json`} />, desktopActions: controls, mobileActions: controls, drawerActions: controls, sectionTrailing: <span className="edition-label">TS · {zh ? "源码预览" : "Source preview"}</span> },
  };
}

export function getPageOptions({ page }: DocumentationCustomizationContext) {
  const zh = page.locale === "zh";
  const published = page.id.endsWith("/quickstart");
  return {
    beforeContent: <aside className="edition-note" aria-label={zh ? "文档基线" : "Documentation baseline"}>
      {published ? (zh ? "本页示例已用发布包 @lenso/core@0.1.0 验证。" : "This example is verified with the published @lenso/core@0.1.0 package.") : (zh ? "本页基于 TypeScript 源码 " : "This page describes TypeScript source ")}
      {!published ? <a href={`https://github.com/LioRael/lenso/tree/${ref}`}>6e239c7</a> : null}
      {" "}<a href={zh ? "/docs/zh/installation/" : "/docs/installation/"}>{zh ? "查看兼容性" : "Check compatibility"}</a>
    </aside>,
    footer: <footer className="article-footer"><a href="https://github.com/LioRael/lenso">GitHub</a><span>{zh ? "文档框架" : "Documentation framework"}: @lenso/docs 0.1.0</span></footer>,
  };
}
