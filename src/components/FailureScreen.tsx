import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

export const FailureScreen: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const titleEl = titleRef.current;
    const descEl = descRef.current;
    const hintEl = hintRef.current;
    if (!titleEl || !descEl || !hintEl) return;

    // Check for user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      titleEl.style.opacity = '1';
      descEl.style.opacity = '1';
      hintEl.style.opacity = '1';
      return;
    }

    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    descEl.style.opacity = '0';
    descEl.style.filter = 'blur(12px)';
    hintEl.style.opacity = '0';
    hintEl.style.filter = 'blur(8px)';

    const timeline = createTimeline();

    timeline
      // Step 1: "FALSO." emerges with deep crimson bloom
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        translateY: [20, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 400)
      // Step 2: "Você foi pego pela presa."
      .add(descEl, {
        opacity: [0, 0.9],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2400,
        ease: 'inOutCubic',
      }, 1600)
      // Step 3: "Comece outra vez."
      .add(hintEl, {
        opacity: [0, 0.7],
        filter: ['blur(8px)', 'blur(0px)'],
        translateY: [8, 0],
        duration: 2200,
        ease: 'inOutCubic',
      }, 2800);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center text-center px-6 bg-[#050303]/98 backdrop-blur-md select-none"
      role="alert"
      aria-live="assertive"
    >
      <h2
        ref={titleRef}
        className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.35em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.65)] uppercase mb-6"
      >
        FALSO.
      </h2>
      <p
        ref={descRef}
        className="font-serif text-lg sm:text-2xl text-[#d4c3c5] tracking-[0.16em] mb-5"
      >
        Você foi pego pela presa.
      </p>
      <p
        ref={hintRef}
        className="font-mono text-xs sm:text-sm text-[#665457] tracking-[0.24em] uppercase italic"
      >
        Comece outra vez.
      </p>
    </div>
  );
};
