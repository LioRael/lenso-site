'use client';

import { useEffect, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const minStepGap = 64;
const easeOut = 'lenso-ease-out';
const easeInOut = 'lenso-ease-in-out';

export function SiteScrollEffects() {
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(CustomEase, ScrollTrigger);
    CustomEase.create(easeOut, 'M0,0 C0.23,1 0.32,1 1,1');
    CustomEase.create(easeInOut, 'M0,0 C0.25,0.1 0.25,1 1,1');

    const root = document.documentElement;
    const scope = document.querySelector<HTMLElement>('.site-home');
    const media = gsap.matchMedia();

    if (!scope) return undefined;

    let scrollFrame = 0;
    const updateHeaderScrolled = () => {
      scrollFrame = 0;
      root.classList.toggle('site-header-scrolled', window.scrollY > 0);
    };
    const requestHeaderScrolledUpdate = () => {
      if (scrollFrame !== 0) return;
      scrollFrame = window.requestAnimationFrame(updateHeaderScrolled);
    };

    updateHeaderScrolled();
    window.addEventListener('scroll', requestHeaderScrolledUpdate, { passive: true });

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
        const heroDemos = Array.from(scope.querySelectorAll<HTMLElement>('[data-hero-demo]'));
        let currentIndex = -1;

        root.classList.toggle('scroll-effects-enabled', !reduceMotion);
        root.classList.toggle('scroll-effects-reduced', reduceMotion);
        gsap.set(badges, { clearProps: 'backgroundColor,boxShadow,color' });

        for (const demo of heroDemos) {
          const tree = demo.querySelector<HTMLElement>('[data-hero-demo-tree]');
          const frames = Array.from(demo.querySelectorAll<HTMLElement>('[data-hero-demo-frame]'));
          const commandShell = demo.querySelector<HTMLElement>('[data-hero-demo-command-shell]');
          const commands = Array.from(demo.querySelectorAll<HTMLElement>('[data-hero-demo-command]'));

          if (!tree || !commandShell || frames.length === 0) continue;

          const getFrameRows = (frame: HTMLElement) =>
            Array.from(frame.querySelectorAll<HTMLElement>('[data-hero-demo-row]'));
          const getFrameHeight = (frame: HTMLElement) =>
            Math.ceil(frame.scrollHeight || frame.getBoundingClientRect().height);
          const setActiveFrame = (activeIndex: number) => {
            frames.forEach((frame, frameIndex) => {
              gsap.set(frame, { autoAlpha: frameIndex === activeIndex ? 1 : 0 });
            });
            commands.forEach((command, commandIndex) => {
              gsap.set(command, { autoAlpha: commandIndex === activeIndex ? 1 : 0, y: 0 });
            });
            gsap.set(tree, {
              height: getFrameHeight(frames[activeIndex]),
            });
            gsap.set(commandShell, { y: 0 });
          };

          setActiveFrame(0);
          frames.forEach((frame) => gsap.set(getFrameRows(frame), { autoAlpha: 1, y: 0 }));

          if (reduceMotion || frames.length < 2) continue;

          const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.1 });
          let activeIndex = 0;

          for (let step = 1; step <= frames.length; step += 1) {
            const nextIndex = step % frames.length;
            const currentFrame = frames[activeIndex];
            const nextFrame = frames[nextIndex];
            const currentRows = getFrameRows(currentFrame);
            const nextRows = getFrameRows(nextFrame);

            timeline
              .to(currentRows, {
                autoAlpha: 0,
                duration: 0.16,
                ease: easeOut,
                stagger: 0.035,
                y: -6,
              }, '+=1.7')
              .add(() => {
                gsap.set(currentFrame, { autoAlpha: 0 });
                gsap.set(nextFrame, { autoAlpha: 1 });
                gsap.set(nextRows, { autoAlpha: 0, y: 7 });
              })
              .to(tree, {
                duration: 0.42,
                ease: easeInOut,
                height: () => getFrameHeight(nextFrame),
              }, '>')
              .fromTo(commands[nextIndex], {
                autoAlpha: 0,
                y: 4,
              }, {
                autoAlpha: 1,
                duration: 0.2,
                ease: easeOut,
                immediateRender: false,
                y: 0,
              }, '<0.04')
              .to(commands[activeIndex], {
                autoAlpha: 0,
                duration: 0.12,
                ease: easeOut,
                y: -4,
              }, '<')
              .to(nextRows, {
                autoAlpha: 1,
                duration: 0.24,
                ease: easeOut,
                stagger: 0.045,
                y: 0,
              }, '<0.02');

            activeIndex = nextIndex;
          }
        }

        if (reduceMotion) {
          gsap.set(revealItems, { autoAlpha: 1, clearProps: 'transform' });
        } else {
          gsap.set(revealItems, { autoAlpha: 0, scale: 0.985, y: 28 });
          ScrollTrigger.batch(revealItems, {
            onEnter: (items) => {
              gsap.to(items, {
                autoAlpha: 1,
                duration: 0.55,
                ease: easeOut,
                overwrite: true,
                scale: 1,
                stagger: 0.04,
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
              ease: easeOut,
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
      if (scrollFrame !== 0) {
        window.cancelAnimationFrame(scrollFrame);
      }
      window.removeEventListener('scroll', requestHeaderScrolledUpdate);
      media.revert();
      root.classList.remove('scroll-effects-enabled', 'scroll-effects-reduced', 'site-header-scrolled');
    };
  }, []);

  return null;
}
