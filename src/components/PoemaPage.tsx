import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

const VERSES = [
  "Falam as lendas que uma pantera vive aqui.",
  "Longe de todo o mal,",
  "O teu rosto me pareceu igual.",
  "Receio ao ver os olhos da pantera,",
  "Em teu rosto, igual.",
  "Saudades de você.",
  "Tem vezes que nem sei se é você.",
  "Apareça, pantera.",
];

export const PoemaPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const versesRef = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const dividerEl = dividerRef.current;
    const verseEls = versesRef.current.filter((el): el is HTMLParagraphElement => el !== null);

    if (!containerEl || !tagEl || !titleEl || !dividerEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      dividerEl.style.opacity = '1';
      verseEls.forEach((el) => {
        el.style.opacity = '1';
      });
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    dividerEl.style.opacity = '0';
    dividerEl.style.transform = 'scaleX(0)';

    verseEls.forEach((el) => {
      el.style.opacity = '0';
      el.style.filter = 'blur(10px)';
    });

    const timeline = createTimeline();

    // 1. Initial fade-in of background container
    timeline
      .add(containerEl, {
        opacity: [0, 1],
        duration: 1200,
        ease: 'inOutCubic',
      }, 0)
      // 2. Tagline
      .add(tagEl, {
        opacity: [0, 0.85],
        duration: 1800,
        ease: 'inOutCubic',
      }, 300)
      // 3. Title "PANTERA"
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        translateY: [24, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 500)
      // 4. Subtle crimson dividing line expands
      .add(dividerEl, {
        opacity: [0, 0.6],
        scaleX: [0, 1],
        duration: 2200,
        ease: 'inOutCubic',
      }, 1600);

    // 5. Staggered reveal of each verse
    verseEls.forEach((el, index) => {
      timeline.add(el, {
        opacity: [0, 0.92],
        filter: ['blur(10px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2000,
        ease: 'inOutCubic',
      }, 2000 + index * 450);
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-y-auto overflow-x-hidden select-text cursor-default flex flex-col items-center justify-center py-10 px-6 sm:px-12"
      style={{ opacity: 0 }}
      aria-label="Poema Pantera — Enigma Antirian"
    >
      {/* Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Main Container */}
      <main className="relative z-20 flex flex-col items-center max-w-2xl w-full my-auto text-center">
        {/* Subtle Category Tag */}
        <span
          ref={tagRef}
          className="font-mono text-[11px] sm:text-xs tracking-[0.35em] text-[#990011] uppercase block mb-3 pointer-events-none"
          style={{ opacity: 0 }}
        >
          VERSOS DO ABISMO
        </span>

        {/* Poem Title */}
        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.3em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase mb-4"
          style={{ opacity: 0 }}
        >
          PANTERA
        </h1>

        {/* Divider Line */}
        <div
          ref={dividerRef}
          className="w-24 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#990011] to-transparent mb-8 sm:mb-10 pointer-events-none"
          style={{ opacity: 0 }}
        />

        {/* Poem Verses (Selectable with Crimson highlight) */}
        <div className="binary-selectable flex flex-col items-center gap-3 sm:gap-3.5 max-w-xl w-full text-center px-2">
          {VERSES.map((verse, idx) => (
            <p
              key={idx}
              ref={(el) => {
                versesRef.current[idx] = el;
              }}
              className="font-serif text-sm sm:text-base md:text-lg text-[#ded3d5] tracking-[0.06em] leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              style={{ opacity: 0 }}
            >
              {verse}
            </p>
          ))}
        </div>
      </main>

      {/* Subtle bottom spacing */}
      <footer className="relative z-20 mt-6 pointer-events-none" />
    </div>
  );
};
