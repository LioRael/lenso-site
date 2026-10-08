"use client";

import { DocumentationSearch, type DocumentationSearchProps } from "@lenso/docs/client";
import { createChineseTokenizer } from "./chinese-tokenizer.mjs";

async function initChineseSearch() {
  const { create } = await import("@orama/orama");
  return create({ schema: { _: "string" }, components: { tokenizer: createChineseTokenizer() } });
}

export function SiteSearch({ locale, ...props }: DocumentationSearchProps & { locale: string }) {
  const zh = locale === "zh";
  return <DocumentationSearch {...props} initOrama={zh ? initChineseSearch : undefined} labels={props.labels ?? (zh ? {
    input: "搜索文档", placeholder: "搜索文档…", close: "关闭搜索", empty: "没有找到结果", error: "搜索加载失败，请重试。",
  } : undefined)} />;
}
