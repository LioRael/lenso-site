'use client';

import { useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const minStepGap = 64;

export function SiteScrollEffects() {
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = document.documentElement;
    const scope = document.querySelector<HTMLElement>('.site-home');
    const media = gsap.matchMedia();

    if (!scope) return undefined;

    media.add(
      {
        isDesktop: '(min-width: 901px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions as {
          isDesktop: boolean;
          reduceMotion: boolean;
        };
        const revealItems = Array.from(scope.querySelectorAll<HTMLElement>('[data-scroll-reveal]'));
        const steps = Array.from(scope.querySelectorAll<HTMLElement>('[data-lifecycle-step]'));
        const stepCopies = steps.map((step) => step.querySelector<HTMLElement>('.lifecycle-step-copy'));
        const badges = steps.map((step) => step.querySelector<HTMLElement>('.lifecycle-step-index'));
        let currentIndex = -1;

        root.classList.toggle('scroll-effects-enabled', !reduceMotion);
        root.classList.toggle('scroll-effects-reduced', reduceMotion);
        gsap.set(badges, { clearProps: 'backgroundColor,boxShadow,color' });

        if (reduceMotion) {
          gsap.set(revealItems, { autoAlpha: 1, clearProps: 'transform' });
        } else {
          gsap.set(revealItems, { autoAlpha: 0, scale: 0.985, y: 28 });
          ScrollTrigger.batch(revealItems, {
            onEnter: (items) => {
              gsap.to(items, {
                autoAlpha: 1,
                duration: 0.7,
                ease: 'power3.out',
                overwrite: true,
                scale: 1,
                stagger: 0.05,
                y: 0,
              });
            },
            once: true,
            start: 'top 86%',
          });
        }

        const getActiveIndex = () => {
          if (steps.length === 0) return -1;

          const stickyTop = Number.parseFloat(getComputedStyle(stepCopies[0] ?? steps[0]).top) || 112;
          let activeIndex = 0;

          for (let index = 1; index < steps.length; index += 1) {
            const previousHeight = stepCopies[index - 1]?.getBoundingClientRect().height ?? 0;
            const switchLine = stickyTop + previousHeight + minStepGap;

            if (steps[index].getBoundingClientRect().top <= switchLine) {
              activeIndex = index;
            }
          }

          return activeIndex;
        };

        const setActive = (activeIndex: number, immediate = false) => {
          if (activeIndex === currentIndex && !immediate) return;

          currentIndex = activeIndex;

          for (let index = 0; index < steps.length; index += 1) {
            const active = index === activeIndex;
            const duration = immediate || reduceMotion ? 0 : 0.26;

            steps[index].dataset.active = String(active);

            gsap.to(steps[index], {
              duration,
              ease: 'power1.out',
              opacity: isDesktop ? (active ? 1 : 0.32) : 1,
              overwrite: 'auto',
            });
          }
        };

        setActive(getActiveIndex(), true);

        for (let index = 1; index < steps.length; index += 1) {
          ScrollTrigger.create({
            onEnter: () => setActive(index),
            onLeaveBack: () => setActive(index - 1),
            onRefresh: () => setActive(getActiveIndex(), true),
            start: () => {
              const stickyTop = Number.parseFloat(getComputedStyle(stepCopies[0] ?? steps[0]).top) || 112;
              const previousHeight = stepCopies[index - 1]?.getBoundingClientRect().height ?? 0;

              return `top ${stickyTop + previousHeight + minStepGap}px`;
            },
            trigger: steps[index],
          });
        }

        void document.fonts?.ready.then(() => ScrollTrigger.refresh());
      },
      scope,
    );

    ScrollTrigger.refresh();

    return () => {
      media.revert();
      root.classList.remove('scroll-effects-enabled', 'scroll-effects-reduced');
    };
  }, []);

  return null;
}
