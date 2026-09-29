import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

/**
 * Component: FlorestaPage
 * 4th Phase of the Enigma Antirian accessible at /floresta.
 * Atmospheric placeholder for Phase 4, keeping the signature
 * dark void, crimson accents, and Anime.js v4 cinematic reveals.
 */
export const FlorestaPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const placeholderNoteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const placeholderNoteEl = placeholderNoteRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl || !placeholderNoteEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
      placeholderNoteEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(12px)';
    placeholderNoteEl.style.opacity = '0';
    placeholderNoteEl.style.filter = 'blur(8px)';

    const timeline = createTimeline();

    timeline
      .add(containerEl, {
        opacity: [0, 1],
        duration: 1400,
        ease: 'inOutCubic',
      }, 0)
      .add(tagEl, {
        opacity: [0, 0.9],
        duration: 2200,
        ease: 'inOutCubic',
      }, 400)
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        translateY: [26, 0],
        duration: 3200,
        ease: 'inOutCubic',
      }, 700)
      .add(subtitleEl, {
        opacity: [0, 0.85],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 2200)
      .add(placeholderNoteEl, {
        opacity: [0, 0.5],
        filter: ['blur(8px)', 'blur(0px)'],
        duration: 2400,
        ease: 'inOutCubic',
      }, 3800);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col items-center justify-center px-6 sm:px-12"
      style={{ opacity: 0 }}
      aria-label="A Floresta — Fase 4 do Enigma"
    >
      {/* Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Content cluster */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-2xl gap-5">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1"
          style={{ opacity: 0 }}
        >
          LIMIAR IV • FASE 4
        </span>

        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.26em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          A FLORESTA.
        </h1>

        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.16em] text-[#8f8083] italic"
          style={{ opacity: 0 }}
        >
          As sombras se fecham e os galhos sussurram segredos esquecidos.
        </p>

        <p
          ref={placeholderNoteRef}
          className="font-mono text-[11px] sm:text-xs text-[#5c4e51] tracking-[0.22em] uppercase italic mt-6"
          style={{ opacity: 0 }}
        >
          [ Espaço reservado para a quarta fase do enigma do professor ]
        </p>
      </div>
    </div>
  );
};
