import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createTimeline } from 'animejs';
import { useNavigate } from 'react-router-dom';
import { audioEngine } from '../audio/audioEngine';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const TARGET_WORD = 'IRIS';

export const XxxxPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const hasNavigatedRef = useRef<boolean>(false);

  const [combination, setCombination] = useState<string[]>(['X', 'X', 'X', 'X']);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    audioEngine.setMood('deep');
  }, []);

  // Entrance animations matching other pages
  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const vaultEl = vaultRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl || !vaultEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
      vaultEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(12px)';
    vaultEl.style.opacity = '0';
    vaultEl.style.filter = 'blur(14px)';

    const timeline = createTimeline();

    timeline
      .add(containerEl, {
        opacity: [0, 1],
        duration: 1200,
        ease: 'inOutCubic',
      }, 0)
      .add(tagEl, {
        opacity: [0, 0.9],
        duration: 1800,
        ease: 'inOutCubic',
      }, 300)
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        translateY: [24, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 600)
      .add(subtitleEl, {
        opacity: [0, 0.9],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2400,
        ease: 'inOutCubic',
      }, 1600)
      .add(vaultEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        scale: [0.96, 1],
        duration: 2800,
        ease: 'inOutCubic',
      }, 2600);
  }, []);

  const rotateSlot = useCallback((index: number, direction: 1 | -1) => {
    if (isUnlocked || hasNavigatedRef.current) return;
    audioEngine.playVaultTick();
    setCombination((prev) => {
      const next = [...prev];
      const curChar = next[index];
      const curIdx = ALPHABET.indexOf(curChar);
      const nextIdx = (curIdx + direction + ALPHABET.length) % ALPHABET.length;
      next[index] = ALPHABET[nextIdx];
      return next;
    });
  }, [isUnlocked]);

  // Check for solution: the moment IRIS is spelled, trigger smooth fade and navigate!
  useEffect(() => {
    if (combination.join('') === TARGET_WORD && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      setIsUnlocked(true);
      setIsFadingOut(true);
      audioEngine.playStinger('success');
      const timer = window.setTimeout(() => {
        navigate('/iris');
      }, 1000);
      return () => window.clearTimeout(timer);
    }
  }, [combination, navigate]);

  // Keyboard navigation & typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUnlocked || hasNavigatedRef.current) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        rotateSlot(activeSlot, -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        rotateSlot(activeSlot, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSlot((prev) => (prev - 1 + 4) % 4);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveSlot((prev) => (prev + 1) % 4);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        audioEngine.playVaultTick();
        setCombination((prev) => {
          const next = [...prev];
          next[activeSlot] = char;
          return next;
        });
        setActiveSlot((prev) => (prev + 1) % 4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlot, isUnlocked, rotateSlot]);

  const getAdjacentChars = (char: string) => {
    const idx = ALPHABET.indexOf(char);
    const prev = ALPHABET[(idx - 1 + ALPHABET.length) % ALPHABET.length];
    const next = ALPHABET[(idx + 1) % ALPHABET.length];
    return { prev, next };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-y-auto overflow-x-hidden select-none cursor-default flex flex-col items-center justify-center py-10 px-4 sm:px-8"
      style={{ opacity: 0 }}
      aria-label="XXXX — Limiar VI"
    >
      {/* Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Main Container */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl w-full gap-5 my-auto">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1 pointer-events-none"
          style={{ opacity: 0 }}
        >
          LIMIAR VI • FASE 6
        </span>

        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.28em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          XXXX.
        </h1>

        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.12em] text-[#a89a9c] italic max-w-xl leading-relaxed select-text"
          style={{ opacity: 0 }}
        >
          No breu primordial, a escuridão dilatou a XXXX dos olhos da pantera; o olhar da fera guarda a passagem.
        </p>

        {/* Cylinder Tumblers */}
        <div
          ref={vaultRef}
          className={`relative mt-4 p-5 sm:p-7 rounded-xl border border-[#4a0d14]/90 bg-gradient-to-b from-[#120709] via-[#090305] to-[#120709] shadow-[0_0_50px_rgba(0,0,0,0.95),inset_0_0_35px_rgba(153,0,17,0.15)] flex flex-col items-center transition-all duration-700 max-w-md w-full ${
            isUnlocked
              ? 'border-[#990011] shadow-[0_0_60px_rgba(230,0,26,0.6),inset_0_0_40px_rgba(230,0,26,0.3)]'
              : ''
          }`}
          style={{ opacity: 0 }}
        >
          {/* Subtle rivets on corners */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#4a0d14]/80 shadow-[0_0_4px_#990011]" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#4a0d14]/80 shadow-[0_0_4px_#990011]" />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#4a0d14]/80 shadow-[0_0_4px_#990011]" />
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#4a0d14]/80 shadow-[0_0_4px_#990011]" />

          {/* Tumbler cylinders grid */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 my-2">
            {combination.map((char, slotIdx) => {
              const { prev, next } = getAdjacentChars(char);
              const isActive = activeSlot === slotIdx;

              return (
                <div
                  key={slotIdx}
                  onClick={() => setActiveSlot(slotIdx)}
                  className={`flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                    isActive ? 'scale-[1.03]' : 'opacity-85'
                  }`}
                  title={`Cilindro ${slotIdx + 1} — Clique ou use as setas`}
                >
                  {/* Up button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlot(slotIdx);
                      rotateSlot(slotIdx, -1);
                    }}
                    disabled={isUnlocked}
                    className="w-10 sm:w-14 h-8 flex items-center justify-center text-[#705055] hover:text-[#e6001a] disabled:opacity-20 transition-colors"
                    aria-label={`Girar cilindro ${slotIdx + 1} para cima`}
                  >
                    ▲
                  </button>

                  {/* Cylinder viewport */}
                  <div
                    onWheel={(e) => {
                      e.preventDefault();
                      rotateSlot(slotIdx, e.deltaY > 0 ? 1 : -1);
                    }}
                    className={`relative w-12 sm:w-16 h-28 sm:h-32 rounded bg-gradient-to-b from-[#0a0304] via-[#1a080b] to-[#0a0304] border flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_10px_15px_rgba(0,0,0,0.95),inset_0_-10px_15px_rgba(0,0,0,0.95)] ${
                      isActive
                        ? 'border-[#990011] shadow-[0_0_15px_rgba(230,0,26,0.3),inset_0_0_15px_rgba(153,0,17,0.3)]'
                        : 'border-[#38090d]'
                    }`}
                  >
                    {/* Previous letter */}
                    <span className="font-mono text-sm sm:text-base text-[#5c3e42] opacity-35 filter blur-[1px] select-none -translate-y-1">
                      {prev}
                    </span>

                    {/* Active letter */}
                    <span
                      className={`font-mono text-2xl sm:text-4xl font-black select-none my-1 transition-all duration-150 ${
                        isUnlocked
                          ? 'text-[#e6001a] drop-shadow-[0_0_18px_rgba(230,0,26,0.9)]'
                          : 'text-[#e6d8db] drop-shadow-[0_0_8px_rgba(230,0,26,0.4)]'
                      }`}
                    >
                      {char}
                    </span>

                    {/* Next letter */}
                    <span className="font-mono text-sm sm:text-base text-[#5c3e42] opacity-35 filter blur-[1px] select-none translate-y-1">
                      {next}
                    </span>

                    {/* Center glass refraction line */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 sm:h-10 border-y border-[#e6001a]/20 pointer-events-none" />
                  </div>

                  {/* Down button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlot(slotIdx);
                      rotateSlot(slotIdx, 1);
                    }}
                    disabled={isUnlocked}
                    className="w-10 sm:w-14 h-8 flex items-center justify-center text-[#705055] hover:text-[#e6001a] disabled:opacity-20 transition-colors"
                    aria-label={`Girar cilindro ${slotIdx + 1} para baixo`}
                  >
                    ▼
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Smooth Cinematic Fade to Next Page */}
      <div
        className={`fixed inset-0 z-50 bg-[#050303] pointer-events-none transition-opacity duration-1000 ease-in-out ${
          isFadingOut ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </div>
  );
};
