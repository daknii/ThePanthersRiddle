import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

export const SubsoloPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const imageCardEl = imageCardRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl || !imageCardEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
      imageCardEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(12px)';
    imageCardEl.style.opacity = '0';
    imageCardEl.style.filter = 'blur(14px)';

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
        duration: 3000,
        ease: 'inOutCubic',
      }, 600)
      .add(subtitleEl, {
        opacity: [0, 0.92],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [14, 0],
        duration: 2600,
        ease: 'inOutCubic',
      }, 1800)
      .add(imageCardEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        translateY: [18, 0],
        scale: [0.97, 1],
        duration: 3000,
        ease: 'inOutCubic',
      }, 2800);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-y-auto overflow-x-hidden select-none cursor-default flex flex-col items-center justify-center py-12 px-6 sm:px-12"
      style={{ opacity: 0 }}
      aria-label="Ecos do Subsolo — Fase 5 do Enigma"
    >
      {/* Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Main Content Cluster */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl gap-5 my-auto">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1 pointer-events-none"
          style={{ opacity: 0 }}
        >
          LIMIAR V • FASE 5
        </span>

        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.24em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          ECOS DO SUBSOLO
        </h1>

        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.12em] text-[#a89a9c] italic max-w-xl leading-relaxed select-text"
          style={{ opacity: 0 }}
        >
          Nem tudo que a imagem silencia está realmente perdido; às vezes, o segredo revela-se apenas quando o excesso é descartado.
        </p>

        {/* Encoded Image Presentation */}
        <div
          ref={imageCardRef}
          className="relative mt-3 sm:mt-5 flex flex-col items-center pointer-events-auto"
          style={{ opacity: 0 }}
        >
          <a
            href="/xxxx.jpg"
            target="_blank"
            rel="noopener noreferrer"
            title="Clique para abrir a imagem original em alta resolução"
            className="group block relative overflow-hidden rounded-sm border border-[#4a0d14]/80 shadow-[0_0_35px_rgba(0,0,0,0.85)] hover:border-[#990011] hover:shadow-[0_0_40px_rgba(230,0,26,0.3)] transition-all duration-500 cursor-pointer"
          >
            <img
              src="/xxxx.jpg"
              alt="Ecos do Subsolo"
              className="w-full max-w-md sm:max-w-lg md:max-w-xl h-auto object-cover transition-transform duration-700 group-hover:scale-[1.015]"
              draggable={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050303]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-3">
              <span className="font-mono text-[11px] tracking-[0.2em] text-[#ded3d5] bg-[#050303]/85 px-3 py-1 rounded border border-[#990011]/60 drop-shadow-[0_0_10px_rgba(230,0,26,0.5)]">
                ABRIR ORIGINAL
              </span>
            </div>
          </a>

          <a
            href="/xxxx.jpg"
            download="xxxx.jpg"
            className="mt-3 font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[#705e62] hover:text-[#990011] uppercase transition-colors duration-300"
          >
            [ baixar arquivo original ]
          </a>
        </div>
      </main>
    </div>
  );
};
