'use client';

import Image from 'next/image';
import { useEffect } from 'react';

const storageKey = 'lenso-theme';
const themes = [
  ['system', '/lenso-assets/theme-system.svg', 'left-[2.5px] top-0.5 h-3 w-[11px]'],
  ['light', '/lenso-assets/theme-light.svg', 'left-[1.25px] top-[1.25px] h-[13.5px] w-[13.5px]'],
  ['dark', '/lenso-assets/theme-dark.svg', 'left-[2.25px] top-[2.25px] h-[11.5px] w-[11.5px]'],
] as const;

type ThemeMode = (typeof themes)[number][0];

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';

  const saved = window.localStorage.getItem(storageKey);
  return isThemeMode(saved) ? saved : 'system';
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const resolved = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;

  root.dataset.theme = resolved;
  root.dataset.themeMode = mode;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

export function ThemeSwitcher() {
  useEffect(() => {
    const syncTheme = (mode: ThemeMode) => {
      applyTheme(mode);
      window.localStorage.setItem(storageKey, mode);

      const input = document.querySelector<HTMLInputElement>(
        `.theme-switcher input[value="${mode}"]`,
      );

      if (input) input.checked = true;
    };

    syncTheme(getStoredMode());

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onMediaChange = () => {
      if (getStoredMode() === 'system') applyTheme('system');
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !isThemeMode(event.newValue)) return;
      syncTheme(event.newValue);
    };

    media.addEventListener('change', onMediaChange);
    window.addEventListener('storage', onStorage);

    return () => {
      media.removeEventListener('change', onMediaChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <fieldset className="theme-switcher relative isolate flex h-6 w-[72px] rounded-full" suppressHydrationWarning>
      <legend className="sr-only">Theme</legend>
      <span aria-hidden="true" className="theme-switcher-ring pointer-events-none absolute inset-0 rounded-full" />
      {themes.map(([theme, icon, iconClassName]) => (
        <label
          className="theme-switcher-option relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full pb-[4.5px] pl-[3.5px] pr-[4.5px] pt-[3.5px]"
          key={theme}
        >
          <input
            aria-label={`${theme} theme`}
            className="sr-only"
            defaultChecked={theme === 'system'}
            name="theme"
            onChange={() => {
              applyTheme(theme);
              window.localStorage.setItem(storageKey, theme);
            }}
            type="radio"
            value={theme}
          />
          <span aria-hidden="true" className="pointer-events-none relative h-4 w-4 shrink-0 overflow-hidden">
            <Image alt="" className={`absolute ${iconClassName}`} height={16} loading="eager" src={icon} width={16} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}
