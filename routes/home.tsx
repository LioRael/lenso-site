"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { DocumentationCompactSearchTrigger } from "@lenso/docs/client";
import { SiteSearch } from "../components/site-search";

const repository = "https://github.com/LioRael/lenso";
const example = `import { defineApp, definePlugin, startApp } from "@lenso/core";

const notes = definePlugin({
  id: "notes",
  setup() {
    return {
      async list() {
        return [];
      },
    };
  },
});

const app = await startApp(defineApp({ plugins: [notes] }));
try {
  console.log(await app.get(notes).list());
} finally {
  await app.stop();
}`;

const copy = {
  en: {
    nav: ["Docs", "Plugins", "Examples", "Agent tools"],
    title: ["Ordinary async code.", "One clear application."],
    description:
      "Compose TypeScript services with explicit plugin dependencies and one shared lifecycle. Start on Bun. Add only what your application needs.",
    start: "Get started",
    explore: "Explore the docs",
    openSource: "Open source on GitHub",
    showcase: "A small application. A real lifecycle.",
    copyCode: "Copy code",
    copied: "Code copied",
    copyFailed: "Clipboard unavailable. Select the code to copy it.",
    sourceLabel: "Application source code",
    published: "This example uses the published @lenso/core@0.2.0 API.",
    annotations: [
      ["Define a service", "Plain objects. Ordinary async methods.", "composition"],
      ["Compose explicitly", "Each plugin declares its exact dependencies.", "composition"],
      ["Own the lifecycle", "Initialize once. Release resources in reverse order.", "lifecycle"],
    ],
    pluginTitle: "Add capabilities. Keep your choices.",
    pluginDescription:
      "Use the plugins your application needs. Keep the underlying services and platform boundaries visible.",
    plugins: [
      ["web", "Web & Fetch", "Typed procedures or native requests. Choose the boundary.", "web"],
      ["auth", "Auth", "Identity and sessions. Your application owns authorization.", "auth"],
      [
        "database",
        "Drizzle & databases",
        "Multiple database instances, with migrations you control.",
        "database",
      ],
      ["files", "Files & storage", "Separate file records from object storage ownership.", "files"],
      ["tasks", "Tasks", "Background work with explicit queue and worker lifecycles.", "tasks"],
      [
        "logs",
        "Logs & telemetry",
        "Application logging and platform-aware observability.",
        "observability",
      ],
    ],
    preview: "Plugin guides use the verified TypeScript 0.2 package matrix.",
    compatibility: "Check compatibility",
    beforeChoosing: "before choosing packages.",
    bunTitle: "Bun first.",
    bunDescription:
      "Run regular async services locally. Inspect, call, develop, and build with the Lenso CLI.",
    bunLink: "Bun deployment",
    workersTitle: "Workers, deliberately.",
    workersDescription:
      "Use the Workers adapter with request-scoped platform bindings. Understand the runtime and resource limits before deploying.",
    workersLink: "Workers guide",
    closing: "Start small. Build your application.",
    architecture: "Read the architecture",
    api: "API index",
    theme: "Toggle light and dark theme",
    menu: "Open navigation",
    navigation: "Main navigation",
  },
  zh: {
    nav: ["文档", "插件", "示例", "Agent 工具"],
    title: ["普通的异步代码。", "清晰的应用组合。"],
    description:
      "用明确的插件依赖和统一的生命周期组合 TypeScript 服务。从 Bun 开始，只添加应用需要的能力。",
    start: "快速开始",
    explore: "浏览文档",
    openSource: "在 GitHub 上查看源码",
    showcase: "一个小应用，完整的生命周期。",
    copyCode: "复制代码",
    copied: "代码已复制",
    copyFailed: "剪贴板不可用，请选中代码后复制。",
    sourceLabel: "应用源码",
    published: "此示例使用已发布的 @lenso/core@0.2.0 API。",
    annotations: [
      ["定义服务", "普通对象，普通异步方法。", "composition"],
      ["明确组合关系", "每个插件声明所依赖的具体实例。", "composition"],
      ["掌握生命周期", "统一初始化，按逆序释放资源。", "lifecycle"],
    ],
    pluginTitle: "扩展能力，保留选择。",
    pluginDescription: "按应用需要组合插件，让底层服务与平台边界始终清晰。",
    plugins: [
      ["web", "Web 与 Fetch", "类型化过程或原生请求，由你选择边界。", "web"],
      ["auth", "Auth", "处理身份与会话，授权仍由应用负责。", "auth"],
      ["database", "Drizzle 与数据库", "使用多个数据库实例，自主掌握迁移。", "database"],
      ["files", "Files 与存储", "区分文件记录与对象存储的资源归属。", "files"],
      ["tasks", "Tasks", "后台任务，明确队列与工作进程的生命周期。", "tasks"],
      ["logs", "日志与可观测性", "应用日志，以及适合不同平台的观测方式。", "observability"],
    ],
    preview: "插件指南使用已核实的 TypeScript 0.2 包版本组合。",
    compatibility: "查看兼容性",
    beforeChoosing: "，再选择包版本。",
    bunTitle: "从 Bun 开始。",
    bunDescription: "在本机运行普通异步服务，用 Lenso CLI 检查、调用、开发与构建应用。",
    bunLink: "Bun 部署指南",
    workersTitle: "理解边界，再用 Workers。",
    workersDescription:
      "通过 Workers 适配器使用请求作用域的平台绑定。部署前，了解运行时与资源限制。",
    workersLink: "Workers 指南",
    closing: "从小处开始，构建你的应用。",
    architecture: "了解应用架构",
    api: "API 索引",
    theme: "切换明暗主题",
    menu: "打开导航",
    navigation: "主导航",
  },
} as const;

type IconName =
  | "arrow"
  | "github"
  | "copy"
  | "check"
  | "sun"
  | "moon"
  | "menu"
  | "web"
  | "auth"
  | "database"
  | "files"
  | "tasks"
  | "logs";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  if (name === "github")
    return (
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.68.08-.68 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.77 10.77 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.27-5.15 5.55.41.35.77 1.03.77 2.08v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
      </svg>
    );
  const paths: Record<Exclude<IconName, "github">, React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    copy: (
      <>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M15 8V4H4v11h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20.9 13.2A9 9 0 0 1 10.8 3.1a9 9 0 1 0 10.1 10.1Z" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    web: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" />
      </>
    ),
    auth: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      </>
    ),
    files: (
      <>
        <path d="M13 2H5v20h14V8Z" />
        <path d="M13 2v6h6M8 16h8" />
      </>
    ),
    tasks: (
      <>
        <path d="M9 5h12M9 12h12M9 19h12" />
        <circle cx="3.5" cy="5" r=".5" />
        <circle cx="3.5" cy="12" r=".5" />
        <circle cx="3.5" cy="19" r=".5" />
      </>
    ),
    logs: <path d="M5 21v-7m7 7V8m7 13V2" />,
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <>
      <span className="home-brand-mark" aria-hidden="true" />
      <span className="home-brand-wordmark" aria-hidden="true" />
    </>
  );
}

const subscribe = () => () => {};
function ThemeButton({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <button
      className="home-icon-button"
      type="button"
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Icon name={mounted && resolvedTheme === "dark" ? "moon" : "sun"} />
    </button>
  );
}

function ExampleCode({ zh }: { zh: boolean }) {
  const text = copy[zh ? "zh" : "en"];
  const [status, setStatus] = useState("");
  return (
    <div className="home-code-area">
      <button
        className="home-icon-button home-copy"
        type="button"
        aria-label={text.copyCode}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(example);
            setStatus(text.copied);
          } catch {
            setStatus(text.copyFailed);
          }
        }}
      >
        <Icon name={status === text.copied ? "check" : "copy"} />
      </button>
      <span className="home-sr-only" role="status">
        {status}
      </span>
      {/* A focusable code viewport supports horizontal keyboard scrolling. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre tabIndex={0} aria-label={text.sourceLabel} dir="ltr">
        <code>
          {example
            .split(/("[^"\n]*"|\b(?:import|from|const|return|async|await|try|finally)\b)/g)
            .map((token, index) =>
              token.startsWith('"') ? (
                <span className="home-code-string" key={index}>
                  {token}
                </span>
              ) : /^(?:import|from|const|return|async|await|try|finally)$/.test(token) ? (
                <span className="home-code-keyword" key={index}>
                  {token}
                </span>
              ) : (
                token
              ),
            )}
        </code>
      </pre>
    </div>
  );
}

export default function Home({ locale }: { locale: string }) {
  const zh = locale === "zh";
  const text = copy[zh ? "zh" : "en"];
  const base = zh ? "/docs/zh" : "/docs";
  const doc = (slug: string) => `${base}/${slug}/`;
  const destinations = [doc("introduction"), "#plugins", doc("examples"), doc("agents")];
  const labels = zh
    ? {
        input: "搜索文档",
        placeholder: "搜索文档…",
        close: "关闭搜索",
        empty: "没有匹配的文档",
        error: "无法加载搜索，请关闭后重试。",
      }
    : undefined;
  return (
    <SiteSearch locale={locale} from={`/_lenso/search/${zh ? "zh" : "en"}.json`} labels={labels}>
      <div className="home-page">
        <header className="home-header">
          <div className="home-header-inner">
            <a className="home-brand" href={zh ? "/zh/" : "/"} aria-label="Lenso">
              <Brand />
            </a>
            <nav className="home-desktop-nav" aria-label={text.navigation}>
              {text.nav.map((label, index) => (
                <a key={label} href={destinations[index]}>
                  {label}
                </a>
              ))}
            </nav>
            <div className="home-actions">
              <DocumentationCompactSearchTrigger />
              <ThemeButton label={text.theme} />
              <a
                className="home-language"
                href={zh ? "/" : "/zh/"}
                hrefLang={zh ? "en" : "zh-CN"}
                lang={zh ? "en" : "zh-CN"}
              >
                <span aria-hidden="true">{zh ? "中文 / " : "EN / "}</span>
                {zh ? "EN" : "中文"}
              </a>
              <a className="home-icon-button home-github" href={repository} aria-label="GitHub">
                <Icon name="github" size={20} />
              </a>
              <details
                className="home-mobile-nav"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector("summary")?.focus();
                  }
                }}
              >
                <summary className="home-icon-button" aria-label={text.menu}>
                  <Icon name="menu" />
                </summary>
                <nav
                  aria-label={text.navigation}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("a"))
                      event.currentTarget.closest("details")?.removeAttribute("open");
                  }}
                >
                  {text.nav.map((label, index) => (
                    <a key={label} href={destinations[index]}>
                      {label}
                    </a>
                  ))}
                  <a href={repository}>GitHub</a>
                </nav>
              </details>
            </div>
          </div>
        </header>
        <main id="main-content">
          <section className="home-hero" aria-labelledby="home-title">
            <h1 id="home-title">
              <span>{text.title[0]}</span>
              <span>{text.title[1]}</span>
            </h1>
            <p className="home-hero-description">{text.description}</p>
            <div className="home-cta-row">
              <a className="home-button home-button-primary" href={doc("quickstart")}>
                {text.start}
              </a>
              <a className="home-button home-button-outline" href={doc("introduction")}>
                {text.explore}
              </a>
            </div>
            <a className="home-repository" href={repository}>
              {text.openSource}
              <Icon name="arrow" size={15} />
            </a>
          </section>
          <section className="home-showcase home-container" aria-labelledby="home-example-title">
            <div className="home-showcase-caption">
              <h2 id="home-example-title">{text.showcase}</h2>
              <span>app.ts</span>
            </div>
            <div className="home-code-frame">
              <ExampleCode zh={zh} />
              <ol className="home-annotations">
                {text.annotations.map(([title, description, slug], index) => (
                  <li key={title}>
                    <span className="home-annotation-number">0{index + 1}</span>
                    <a href={doc(slug)}>{title}</a>
                    <p>{description}</p>
                  </li>
                ))}
              </ol>
            </div>
            <p className="home-code-version">{text.published}</p>
          </section>
          <section className="home-plugins home-container" aria-labelledby="home-plugins-title">
            <div id="plugins" className="home-section-heading">
              <h2 id="home-plugins-title">{text.pluginTitle}</h2>
              <p>{text.pluginDescription}</p>
            </div>
            <div className="home-plugin-list">
              {text.plugins.map(([icon, title, description, slug]) => (
                <a className="home-plugin" key={slug} href={doc(slug)}>
                  <span className="home-plugin-icon">
                    <Icon name={icon} size={27} />
                  </span>
                  <div>
                    <h3>
                      {title}
                      <Icon name="arrow" size={19} />
                    </h3>
                    <p>{description}</p>
                  </div>
                </a>
              ))}
            </div>
            <p className="home-preview-note">
              {text.preview} <a href={doc("installation")}>{text.compatibility}</a>
              {zh ? "" : " "}
              {text.beforeChoosing}
            </p>
          </section>
          <section
            className="home-runtimes home-container"
            aria-label={zh ? "运行时与部署" : "Runtimes and deployment"}
          >
            <div>
              <h2>{text.bunTitle}</h2>
              <p>{text.bunDescription}</p>
              <a className="home-text-link" href={doc("deployment")}>
                {text.bunLink}
                <Icon name="arrow" size={18} />
              </a>
            </div>
            <div>
              <h2>{text.workersTitle}</h2>
              <p>{text.workersDescription}</p>
              <a className="home-text-link" href={doc("workers")}>
                {text.workersLink}
                <Icon name="arrow" size={18} />
              </a>
            </div>
          </section>
          <section className="home-closing home-container" aria-labelledby="home-closing-title">
            <h2 id="home-closing-title">{text.closing}</h2>
            <div className="home-cta-row">
              <a className="home-button home-button-primary" href={doc("quickstart")}>
                {text.start}
              </a>
              <a className="home-button home-button-outline" href={doc("composition")}>
                {text.architecture}
              </a>
            </div>
          </section>
        </main>
        <footer className="home-footer home-container">
          <a className="home-brand" href={zh ? "/zh/" : "/"} aria-label="Lenso">
            <Brand />
          </a>
          <nav aria-label={zh ? "页脚导航" : "Footer navigation"}>
            <a href={doc("introduction")}>{text.nav[0]}</a>
            <a href={doc("api")}>{text.api}</a>
            <a href={repository}>GitHub</a>
          </nav>
        </footer>
      </div>
    </SiteSearch>
  );
}
