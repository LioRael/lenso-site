'use client';

import {
  BadgeCheck,
  Boxes,
  CircleCheck,
  FileCode2,
  FolderTree,
  MonitorCog,
  SendHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Phase = 'input' | 'thinking' | 'app' | 'result';

const appPrompt = 'Create a new Lenso project.';
const modulePrompt = 'Add a support-ticket module to this project.';

const appLines = [
  'lenso host init my-lenso-app',
  'API, worker, migrations',
  'hosted /console',
];

const resultCards: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: 'Module authored',
    text: 'Tickets data, reply action, route, manifest.',
    icon: Boxes,
  },
  {
    title: 'Mounted in host',
    text: 'Admin data and runtime proof wired into the app.',
    icon: FolderTree,
  },
  {
    title: 'Checks passed',
    text: 'Manifest, contract, host API, runtime story.',
    icon: BadgeCheck,
  },
  {
    title: 'Console verified',
    text: 'Actions, data, and evidence visible in /console.',
    icon: MonitorCog,
  },
];

const proofLines = [
  'lenso module create support --with-console',
  'pnpm smoke:support-ticket',
  'open /console',
];

const thinkingRuns = {
  app: {
    message: 'I will scaffold the Lenso project first, then verify the host surface.',
    steps: [
      ['skill', 'lenso-start'],
      ['tool', 'lenso host init my-lenso-app'],
      ['check', 'API, worker, migrations, /console'],
    ],
  },
  module: {
    message: 'I will keep the new app as context and add the support-ticket module.',
    steps: [
      ['skill', 'lenso-module-authoring'],
      ['tool', 'lenso module create support'],
      ['check', 'smoke test + /console proof'],
    ],
  },
} as const;

type Timeline = {
  pause: () => void;
  resume: () => void;
  kill: () => void;
};

type MatchMediaController = {
  add: (
    conditions: { reduceMotion: string; allowMotion: string },
    callback: (context: { conditions?: { reduceMotion?: boolean; allowMotion?: boolean } }) => void | (() => void),
    scope?: Element,
  ) => void;
  revert: () => void;
};

export function HeroProductDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const [phase, setPhase] = useState<Phase>('input');

  useEffect(() => {
    let cancelled = false;
    let media: MatchMediaController | null = null;

    void import('gsap').then(({ gsap }) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const promptBubble = promptRef.current;
      if (!root || !stage || !promptBubble || cancelled) return;

      media = gsap.matchMedia() as MatchMediaController;
      media.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          allowMotion: '(prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const conditions = context.conditions;
          const thinking = root.querySelector('[data-thinking]');
          const thinkingTitle = root.querySelector('[data-thinking-title]');
          const thinkingMessage = root.querySelector('[data-thinking-message]');
          const thinkingProcess = root.querySelector('[data-thinking-process]');
          const appResult = root.querySelector('[data-app-result]');
          const result = root.querySelector('[data-result]');
          const followupPrompt = root.querySelector('[data-followup-prompt]');
          const followupText = root.querySelector('[data-followup-prompt-text]');
          const followupCursor = root.querySelector('[data-followup-cursor]');
          const promptText = root.querySelector('[data-prompt-text]');
          const cursor = root.querySelector('[data-cursor]');
          const send = root.querySelector('[data-send]');
          const thinkingItems = root.querySelectorAll('[data-thinking-item]');
          const thinkingItemLabels = root.querySelectorAll('[data-thinking-item-label]');
          const thinkingItemTexts = root.querySelectorAll('[data-thinking-item-text]');
          const appItems = root.querySelectorAll('[data-app-item]');
          const resultItems = root.querySelectorAll('[data-result-item]');
          const typeState = { chars: 0 };

          const setThinkingContent = (run: keyof typeof thinkingRuns) => {
            const content = thinkingRuns[run];
            if (thinkingTitle) thinkingTitle.textContent = 'Agent';
            if (thinkingMessage) thinkingMessage.textContent = content.message;
            content.steps.forEach(([label, text], index) => {
              const labelNode = thinkingItemLabels[index];
              const textNode = thinkingItemTexts[index];
              if (labelNode) labelNode.textContent = label;
              if (textNode) textNode.textContent = text;
            });
          };

          const promptLayout = (mode: 'input' | 'history') => {
            const stageWidth = stage.clientWidth;
            const stageHeight = stage.clientHeight;
            const baseWidth = promptBubble.offsetWidth;
            const baseHeight = promptBubble.offsetHeight;
            const initialScale = stageWidth < 460 ? 1 : 1.08;
            const historyScale = stageWidth < 460 ? 0.9 : 0.72;
            const scale = mode === 'input' ? initialScale : historyScale;
            const x = mode === 'input' ? Math.max((stageWidth - baseWidth * scale) / 2 - 20, 0) : 0;
            const y = mode === 'input'
              ? stageWidth < 460
                ? 48
                : Math.max((stageHeight - baseHeight * scale) / 2 - 20, 88)
              : 0;

            return {
              x,
              y,
              scale,
              transformOrigin: 'left top',
            };
          };

          const layoutPrompt = (mode: 'input' | 'history') => {
            gsap.set(promptBubble, promptLayout(mode));
          };

          const followupLayout = (mode: 'append' | 'history') => {
            if (!(followupPrompt instanceof HTMLElement)) return { x: 0, y: 0, scale: 1 };

            const stageWidth = stage.clientWidth;
            const stageHeight = stage.clientHeight;
            const scale = stageWidth < 460 ? 0.95 : 0.78;
            const appBottom = appResult instanceof HTMLElement ? appResult.offsetTop + appResult.offsetHeight : 380;
            const y = mode === 'history'
              ? 0
              : Math.min(appBottom + 12 - followupPrompt.offsetTop, stageHeight - followupPrompt.offsetHeight * scale - 24);

            return {
              x: 0,
              y,
              scale,
              transformOrigin: 'left top',
            };
          };

          if (conditions?.reduceMotion) {
            setPhase('result');
            gsap.set([thinking, appResult, send, promptBubble], { autoAlpha: 0 });
            gsap.set(followupPrompt, { ...followupLayout('history'), autoAlpha: 1 });
            gsap.set(thinkingProcess, { autoAlpha: 1, y: 0 });
            gsap.set(thinkingItems, { autoAlpha: 1, y: 0 });
            gsap.set(result, { autoAlpha: 1, y: 0 });
            gsap.set(resultItems, { autoAlpha: 1, y: 0 });
            gsap.set([cursor, followupCursor], { autoAlpha: 0 });
            if (followupText) followupText.textContent = modulePrompt;
            return;
          }

          if (!conditions?.allowMotion) return;

          const timeline = gsap.timeline({ repeat: -1 });
          timeline
            .call(() => {
              setPhase('input');
              gsap.set(promptBubble, { autoAlpha: 1 });
              gsap.set(followupPrompt, { autoAlpha: 0 });
              layoutPrompt('input');
            })
            .set([thinking, appResult, result, appItems, resultItems], { autoAlpha: 0, y: 12 })
            .set(thinkingItems, { autoAlpha: 0, y: 8 })
            .set(send, { autoAlpha: 0, y: 8 })
            .set(cursor, { autoAlpha: 1 })
            .call(() => {
              typeState.chars = 0;
              if (promptText) promptText.textContent = '';
            })
            .to(typeState, {
              chars: appPrompt.length,
              duration: 1.55,
              ease: 'none',
              snap: { chars: 1 },
              onUpdate: () => {
                if (promptText) promptText.textContent = appPrompt.slice(0, Math.round(typeState.chars));
              },
            })
            .to(cursor, { autoAlpha: 0, duration: 0.12 }, '>-0.1')
            .to(send, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out' }, '<')
            .to({}, { duration: 0.42 })
            .call(() => {
              setPhase('thinking');
              setThinkingContent('app');
            })
            .to(send, { autoAlpha: 0, y: 8, duration: 0.18, ease: 'power3.out' })
            .to(promptBubble, { ...promptLayout('history'), duration: 0.56, ease: 'power3.inOut' }, '<')
            .set(thinkingProcess, { autoAlpha: 1, y: 0 }, '<')
            .set(thinkingItems, { autoAlpha: 0, y: 8 }, '<')
            .to(thinking, { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power3.out' }, '<0.18')
            .to(thinkingItems, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.26, ease: 'power3.out' }, '<0.16')
            .to({}, { duration: 0.45 })
            .call(() => setPhase('app'))
            .to(thinkingProcess, { autoAlpha: 0, y: -6, duration: 0.18, ease: 'power3.out' })
            .to(thinking, { autoAlpha: 0, y: -10, duration: 0.22, ease: 'power3.out' }, '<0.04')
            .to(appResult, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, '<0.08')
            .to(appItems, { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.05, ease: 'power3.out' }, '<0.08')
            .to({}, { duration: 1.55 })
            .call(() => {
              setPhase('input');
              typeState.chars = 0;
              if (followupText) followupText.textContent = '';
            })
            .set(followupPrompt, { ...followupLayout('append'), autoAlpha: 0 })
            .set(send, { autoAlpha: 0, y: 8 })
            .set(followupCursor, { autoAlpha: 1 })
            .to(followupPrompt, { autoAlpha: 1, duration: 0.22, ease: 'power3.out' })
            .to(typeState, {
              chars: modulePrompt.length,
              duration: 1.95,
              ease: 'none',
              snap: { chars: 1 },
              onUpdate: () => {
                if (followupText) followupText.textContent = modulePrompt.slice(0, Math.round(typeState.chars));
              },
            })
            .to(followupCursor, { autoAlpha: 0, duration: 0.12 }, '>-0.1')
            .to({}, { duration: 0.36 })
            .call(() => {
              setPhase('thinking');
              setThinkingContent('module');
            })
            .to([appResult, promptBubble], { autoAlpha: 0, y: -10, duration: 0.24, ease: 'power3.out' })
            .to(followupPrompt, { ...followupLayout('history'), duration: 0.56, ease: 'power3.inOut' }, '<')
            .set(thinkingProcess, { autoAlpha: 1, y: 0 }, '<')
            .set(thinkingItems, { autoAlpha: 0, y: 8 }, '<')
            .to(thinking, { autoAlpha: 1, y: 0, duration: 0.32, ease: 'power3.out' }, '<0.18')
            .to(thinkingItems, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.26, ease: 'power3.out' }, '<0.16')
            .to({}, { duration: 0.45 })
            .call(() => setPhase('result'))
            .to(thinkingProcess, { autoAlpha: 0, y: -6, duration: 0.18, ease: 'power3.out' })
            .to(thinking, { autoAlpha: 0, y: -10, duration: 0.22, ease: 'power3.out' }, '<0.04')
            .to(result, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, '<0.08')
            .to(resultItems, { autoAlpha: 1, y: 0, duration: 0.24, stagger: 0.04, ease: 'power3.out' }, '<0.08')
            .to({}, { duration: 2.6 });

          timelineRef.current = timeline;

          return () => {
            timeline.kill();
            if (timelineRef.current === timeline) timelineRef.current = null;
          };
        },
        root,
      );
    });

    return () => {
      cancelled = true;
      timelineRef.current?.kill();
      timelineRef.current = null;
      media?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-label="Animated Lenso agent session demo"
      data-active-phase={phase}
      onPointerEnter={() => timelineRef.current?.pause()}
      onPointerLeave={() => timelineRef.current?.resume()}
      className="min-w-0 overflow-hidden rounded-[6px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.04),0_8px_8px_-8px_rgba(0,0,0,0.04)] dark:bg-[#171717] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14)]"
    >
      <div ref={stageRef} className="relative min-h-[820px] min-w-0 overflow-hidden bg-[#fafafa] p-4 sm:min-h-[600px] sm:p-5 dark:bg-[#121212]">
        <div
          ref={promptRef}
          className="absolute left-4 top-4 z-20 w-[calc(100%-32px)] max-w-[420px] rounded-[6px] border border-[#ebebeb] bg-white p-3 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.35)] sm:left-5 sm:top-5 sm:w-[calc(100%-40px)] dark:border-[#2e2e2e] dark:bg-[#171717]"
        >
          <div className="font-mono text-[12px] leading-4 text-[#8f8f8f]">User prompt</div>
          <div className="mt-2 min-h-[64px]">
            <p
              aria-label="Prompt typed by the demo"
              className="text-[20px] font-semibold leading-[26px] tracking-normal text-[#171717] dark:text-white"
            >
              <span data-prompt-text />
              <span data-cursor className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 bg-[#171717] dark:bg-white" />
            </p>
          </div>
          <div
            data-send
            className="absolute bottom-3 right-3 flex size-7 items-center justify-center rounded-[6px] bg-[#171717] text-white shadow-[0_6px_18px_-12px_rgba(0,0,0,0.45)] dark:bg-white dark:text-[#171717]"
            aria-hidden="true"
          >
            <SendHorizontal className="size-3.5" />
          </div>
        </div>

        <div
          data-followup-prompt
          className="absolute left-4 top-4 z-20 w-[calc(100%-32px)] max-w-[420px] rounded-[6px] border border-[#ebebeb] bg-white p-3 opacity-0 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.35)] sm:left-5 sm:top-5 sm:w-[calc(100%-40px)] dark:border-[#2e2e2e] dark:bg-[#171717]"
        >
          <div className="font-mono text-[12px] leading-4 text-[#8f8f8f]">User prompt</div>
          <div className="mt-2 min-h-[64px]">
            <p
              aria-label="Follow-up prompt typed by the demo"
              className="text-[20px] font-semibold leading-[26px] tracking-normal text-[#171717] dark:text-white"
            >
              <span data-followup-prompt-text />
              <span data-followup-cursor className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 bg-[#171717] dark:bg-white" />
            </p>
          </div>
        </div>

        <div data-thinking className="absolute inset-x-4 top-[154px] z-10 sm:inset-x-5 md:top-[150px]">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-[#ebebeb] bg-white dark:border-[#2e2e2e] dark:bg-[#171717]">
              <span className="size-1.5 rounded-full bg-[#171717] dark:bg-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div data-thinking-process>
                <div className="max-w-[460px] rounded-[6px] border border-[#ebebeb] bg-white p-3 shadow-[0_8px_24px_-22px_rgba(0,0,0,0.35)] dark:border-[#2e2e2e] dark:bg-[#171717]">
                  <div data-thinking-title className="font-mono text-[12px] leading-4 text-[#8f8f8f]">
                    Agent
                  </div>
                  <p data-thinking-message className="mt-2 text-[14px] leading-5 text-[#171717] dark:text-white">
                    I will scaffold the Lenso project first, then verify the host surface.
                  </p>
                </div>

                <div className="mt-2 max-w-[460px] overflow-hidden rounded-[6px] border border-[#ebebeb] bg-white dark:border-[#2e2e2e] dark:bg-[#171717]">
                  {thinkingRuns.app.steps.map(([label, text]) => (
                    <div
                      key={label}
                      data-thinking-item
                      className="grid grid-cols-[58px_1fr] gap-3 border-t border-[#ebebeb] px-3 py-2 first:border-t-0 dark:border-[#2e2e2e]"
                    >
                      <span data-thinking-item-label className="font-mono text-[12px] leading-5 text-[#8f8f8f]">
                        {label}
                      </span>
                      <span data-thinking-item-text className="min-w-0 font-mono text-[13px] leading-5 text-[#4d4d4d] dark:text-[#a1a1a1]">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-app-result className="absolute inset-x-4 top-[120px] z-10 sm:inset-x-5">
          <div data-app-item className="font-mono text-[12px] leading-4 text-[#8f8f8f]">
            Agent step 1
          </div>
          <h2 data-app-item className="mt-1 text-[24px] font-semibold leading-8 tracking-normal text-[#171717] dark:text-white">
            Project scaffolded and ready for module work.
          </h2>

          <div data-app-item className="mt-3 overflow-hidden rounded-[6px] border border-[#ebebeb] bg-white dark:border-[#2e2e2e] dark:bg-[#171717]">
            <div className="flex h-9 items-center gap-2 border-b border-[#ebebeb] px-3 dark:border-[#2e2e2e]">
              <FolderTree className="size-4 text-[#8f8f8f]" aria-hidden="true" />
              <span className="font-mono text-[12px] leading-4 text-[#8f8f8f]">my-lenso-app</span>
            </div>
            <div className="grid gap-2 p-3 font-mono text-[13px] leading-5 text-[#4d4d4d] dark:text-[#a1a1a1]">
              {appLines.map((item) => (
                <div key={item} className="flex min-w-0 items-center gap-2">
                  <CircleCheck className="size-4 shrink-0 text-[#171717] dark:text-white" aria-hidden="true" />
                  <span className="min-w-0 whitespace-pre-wrap break-words">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div data-app-item className="mt-3 rounded-[6px] border border-[#ebebeb] bg-white px-3 py-2.5 font-mono text-[13px] leading-5 text-[#4d4d4d] dark:border-[#2e2e2e] dark:bg-[#171717] dark:text-[#a1a1a1]">
            Next prompt uses this project as context.
          </div>
        </div>

        <div data-result className="absolute inset-x-4 top-[178px] z-10 sm:inset-x-5 sm:top-[120px]">
          <div data-result-item className="font-mono text-[12px] leading-4 text-[#8f8f8f]">
            Agent step 2
          </div>
          <h2 data-result-item className="mt-1 text-[24px] font-semibold leading-8 tracking-normal text-[#171717] dark:text-white">
            Support-ticket module added to the project.
          </h2>

          <div className="mt-3 grid gap-px overflow-hidden rounded-[6px] border border-[#ebebeb] bg-[#ebebeb] sm:grid-cols-2 dark:border-[#2e2e2e] dark:bg-[#2e2e2e]">
            {resultCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} data-result-item className="bg-white p-3 dark:bg-[#171717]">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-[#171717] dark:text-white" aria-hidden="true" />
                    <div className="font-medium text-[#171717] dark:text-white">{card.title}</div>
                  </div>
                  <p className="mt-2 text-[13px] leading-5 text-[#4d4d4d] dark:text-[#a1a1a1]">{card.text}</p>
                </div>
              );
            })}
          </div>

          <div
            data-result-item
            className="mt-3 overflow-hidden rounded-[6px] bg-[#171717] text-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-[#0a0a0a] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14)]"
          >
            <div className="flex h-9 items-center gap-2 border-b border-white/10 px-3">
              <FileCode2 className="size-4 text-white/60" aria-hidden="true" />
              <span className="font-mono text-[12px] leading-4 text-white/60">module proof</span>
            </div>
            <div className="grid gap-2 p-3 font-mono text-[13px] leading-5">
              {proofLines.map((item) => (
                <div key={item} className="flex min-w-0 items-center gap-2">
                  <CircleCheck className="size-4 shrink-0 text-white/70" aria-hidden="true" />
                  <span className="min-w-0 whitespace-pre-wrap break-words">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
