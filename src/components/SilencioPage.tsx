import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';
import { audioEngine } from '../audio/audioEngine';

export const SilencioPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    audioEngine.setMood('deep');
  }, []);

  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const noteEl = noteRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl || !noteEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
      noteEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(12px)';
    noteEl.style.opacity = '0';
    noteEl.style.filter = 'blur(10px)';

    const timeline = createTimeline();

    timeline
      .add(containerEl, {
        opacity: [0, 1],
        duration: 1400,
        ease: 'inOutCubic',
      }, 0)
      .add(tagEl, {
        opacity: [0, 0.9],
        duration: 2000,
        ease: 'inOutCubic',
      }, 300)
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        translateY: [24, 0],
        duration: 3000,
        ease: 'inOutCubic',
      }, 600)
      .add(subtitleEl, {
        opacity: [0, 0.9],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2600,
        ease: 'inOutCubic',
      }, 1800)
      .add(noteEl, {
        opacity: [0, 0.6],
        filter: ['blur(10px)', 'blur(0px)'],
        translateY: [10, 0],
        duration: 2400,
        ease: 'inOutCubic',
      }, 2800);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col items-center justify-center px-6 sm:px-12"
      style={{ opacity: 0 }}
      aria-label="Silêncio — Limiar VIII"
    >
      {/* Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl gap-5 my-auto">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1 pointer-events-none"
          style={{ opacity: 0 }}
        >
          LIMIAR VIII • FASE 8
        </span>

        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.28em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          SILÊNCIO.
        </h1>

        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.16em] text-[#8f8083] italic max-w-lg leading-relaxed select-text"
          style={{ opacity: 0 }}
        >
          Sussurros do abismo; o rugido calou a floresta e revelou o vazio.
        </p>

        <p
          ref={noteRef}
          className="font-mono text-[11px] sm:text-xs text-[#5c4e51] tracking-[0.22em] uppercase italic mt-6 pointer-events-none"
          style={{ opacity: 0 }}
        >
          [ Espaço reservado para o próximo enigma ]
        </p>
      </main>
    </div>
  );
};
