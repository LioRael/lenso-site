"use client";

import { useTheme } from "next-themes";

export function SiteControls({ locale, alternate }: { locale: string; alternate: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const zh = locale === "zh";
  return <div className="site-controls">
    <a href={alternate} hrefLang={zh ? "en" : "zh-CN"} lang={zh ? "en" : "zh-CN"}>{zh ? "English" : "中文"}</a>
    <button type="button" aria-label={zh ? "切换明暗主题" : "Toggle light and dark theme"} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z" /></svg>
    </button>
  </div>;
}
