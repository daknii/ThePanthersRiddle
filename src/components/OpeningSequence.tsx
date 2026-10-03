import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

interface OpeningSequenceProps {
  onComplete: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    if (!tagEl || !titleEl || !subtitleEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      tagEl.style.opacity = '0.9';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '0.7';
      const timer = window.setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }

    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(14px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(10px)';

    const timeline = createTimeline({
      onComplete: () => {
        onComplete();
      },
    });

    timeline
      .add(tagEl, {
        opacity: [0, 0.9],
        duration: 2000,
        ease: 'inOutCubic',
      }, 400)
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 3200,
        ease: 'inOutCubic',
      }, 1000)
      .add(subtitleEl, {
        opacity: [0, 0.75],
        filter: ['blur(10px)', 'blur(0px)'],
        translateY: [10, 0],
        duration: 2600,
        ease: 'inOutCubic',
      }, 3400);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute top-10 sm:top-12 left-0 right-0 z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none"
      aria-live="polite"
    >
      <span
        ref={tagRef}
        className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-2 pointer-events-none"
      >
        LIMIAR I • FASE 1
      </span>
      <h1
        ref={titleRef}
        className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.25em] text-[#990011] drop-shadow-[0_0_25px_rgba(230,0,26,0.55)] uppercase"
      >
        NÃO PISARÁS EM FALSO.
      </h1>
      <p
        ref={subtitleRef}
        className="font-mono text-xs sm:text-sm tracking-[0.18em] text-[#6d6466] mt-3 uppercase italic"
      >
        Guarde a primeira letra, sempre.
      </p>
    </div>
  );
};
