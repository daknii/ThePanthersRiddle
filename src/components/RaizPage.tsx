import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

export const RaizPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const textEl = textRef.current;
    const dividerEl = dividerRef.current;
    if (!containerEl || !tagEl || !textEl || !dividerEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      textEl.style.opacity = '1';
      dividerEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    textEl.style.opacity = '0';
    textEl.style.filter = 'blur(16px)';
    dividerEl.style.opacity = '0';
    dividerEl.style.transform = 'scaleX(0)';

    const timeline = createTimeline();

    timeline
      .add(containerEl, {
        opacity: [0, 1],
        duration: 1200,
        ease: 'inOutCubic',
      }, 0)
      .add(tagEl, {
        opacity: [0, 0.85],
        duration: 1800,
        ease: 'inOutCubic',
      }, 300)
      .add(textEl, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        translateY: [20, 0],
        duration: 3000,
        ease: 'inOutCubic',
      }, 600)
      .add(dividerEl, {
        opacity: [0, 0.5],
        scaleX: [0, 1],
        duration: 2000,
        ease: 'inOutCubic',
      }, 1600);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col items-center justify-center px-6 sm:px-12"
      style={{ opacity: 0 }}
      aria-label="Raiz — A Chave"
    >
      {/* Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Main Message Cluster */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl gap-5">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1 pointer-events-none"
          style={{ opacity: 0 }}
        >
          ECOS DO ABISMO
        </span>

        <h1
          ref={textRef}
          className="font-serif text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.2em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          Raiz é apenas a chave.
        </h1>

        <div
          ref={dividerRef}
          className="w-24 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#990011] to-transparent mt-2 pointer-events-none"
          style={{ opacity: 0 }}
        />
      </main>
    </div>
  );
};
