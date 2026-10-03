import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

export const Page3: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const pathRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const pathEl = pathRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl || !pathEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      tagEl.style.opacity = '0.9';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
      pathEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(12px)';
    pathEl.style.opacity = '0';
    pathEl.style.filter = 'blur(20px)';

    const timeline = createTimeline();

    timeline
      .add(containerEl, {
        opacity: [0, 1],
        duration: 1200,
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
        duration: 3200,
        ease: 'inOutCubic',
      }, 600)
      .add(subtitleEl, {
        opacity: [0, 0.85],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [14, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 2200)
      .add(pathEl, {
        opacity: [0, 1],
        filter: ['blur(20px)', 'blur(0px)'],
        scale: [0.92, 1],
        duration: 3600,
        ease: 'inOutCubic',
      }, 3800);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col justify-between items-center py-12 px-6 sm:px-12"
      style={{ opacity: 0 }}
      aria-label="Página 3 do Enigma"
    >
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <header className="relative z-20 flex flex-col items-center text-center mt-4 sm:mt-8 max-w-3xl pointer-events-none">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-3 pointer-events-none"
        >
          LIMIAR III • FASE 3
        </span>
        <h1
          ref={titleRef}
          className="font-serif text-2xl sm:text-3xl md:text-[2.65rem] font-extrabold tracking-[0.18em] text-[#990011] drop-shadow-[0_0_30px_rgba(230,0,26,0.5)] uppercase mb-5 leading-snug"
          style={{ opacity: 0 }}
        >
          DE SUAS PALAVRAS TROCADAS, CRIEI POEMAS.
        </h1>
        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.14em] text-[#8f8083] italic"
          style={{ opacity: 0 }}
        >
          As iniciais me mostraram coisas além das últimas barras.
        </p>
      </header>

      <main className="relative z-20 flex-1 flex items-center justify-center w-full">
        <p
          ref={pathRef}
          className="binary-selectable font-mono text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.3em] text-[#d9c7cb] drop-shadow-[0_0_45px_rgba(230,0,26,0.25)] select-text"
          style={{
            opacity: 0,
            textShadow: '0 0 60px rgba(153, 0, 17, 0.35), 0 0 120px rgba(153, 0, 17, 0.15)',
          }}
        >
          /klvnz
        </p>
      </main>

      <footer className="relative z-20 mb-2 pointer-events-none" />
    </div>
  );
};
