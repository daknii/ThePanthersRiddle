import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

export const KlvnzPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const cipherRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const titleEl = titleRef.current;
    const hintEl = hintRef.current;
    const cipherEl = cipherRef.current;
    if (!containerEl || !titleEl || !hintEl || !cipherEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      hintEl.style.opacity = '1';
      cipherEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(18px)';
    hintEl.style.opacity = '0';
    hintEl.style.filter = 'blur(12px)';
    cipherEl.style.opacity = '0';
    cipherEl.style.filter = 'blur(14px)';

    const timeline = createTimeline();

    timeline
      .add(containerEl, {
        opacity: [0, 1],
        duration: 1400,
        ease: 'inOutCubic',
      }, 0)
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(18px)', 'blur(0px)'],
        translateY: [30, 0],
        duration: 3400,
        ease: 'inOutCubic',
      }, 500)
      .add(hintEl, {
        opacity: [0, 0.8],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 2400)
      .add(cipherEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        scale: [0.88, 1],
        duration: 3200,
        ease: 'inOutCubic',
      }, 4200);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col items-center justify-center px-6 sm:px-12"
      style={{ opacity: 0 }}
      aria-label="KLVNZ — Enigma Antirian"
    >
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <div className="relative z-20 flex flex-col items-center text-center max-w-2xl gap-6">
        <h1
          ref={titleRef}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.35em] text-[#990011] drop-shadow-[0_0_40px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          KLVNZ.
        </h1>

        <p
          ref={hintRef}
          className="font-mono text-sm sm:text-base md:text-lg tracking-[0.14em] text-[#8f8083] italic"
          style={{ opacity: 0 }}
        >
          Ainda estás a olhar para as palavras trocadas.
        </p>

        <p
          ref={cipherRef}
          className="font-display text-6xl sm:text-7xl md:text-8xl font-bold tracking-[0.4em] text-[#d9c7cb] mt-8"
          style={{
            opacity: 0,
            textShadow: '0 0 50px rgba(153, 0, 17, 0.4), 0 0 100px rgba(153, 0, 17, 0.2)',
          }}
        >
          A↔️Z
        </p>
      </div>
    </div>
  );
};
