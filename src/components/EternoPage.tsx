import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createTimeline, animate } from 'animejs';
import { useNavigate } from 'react-router-dom';
import { audioEngine } from '../audio/audioEngine';
import { PantherEyes } from './PantherEyes';
import { useCursorTracking } from '../hooks/useCursorTracking';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const WORD_1 = ['N', 'A', 'D', 'A'];
const WORD_2 = ['E', 'X', 'I', 'S', 'T', 'E'];
const TARGET_FULL = [...WORD_1, ...WORD_2]; // 10 letters: NADA EXISTE

export const EternoPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  const tumblersRef = useRef<HTMLDivElement>(null);
  const epilogueRef = useRef<HTMLDivElement>(null);

  const cursor = useCursorTracking({ enabled: true });

  // Guard: Direct URL access will NOT work without eterno() in console
  const [isAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('trevas_unlocked') === 'true';
  });

  const [combination, setCombination] = useState<string[]>([
    'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X',
  ]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showEpilogue, setShowEpilogue] = useState<boolean>(false);

  // If unauthorized access (direct URL typing), redirect back to /trevas
  useEffect(() => {
    if (!isAuthorized) {
      const timer = window.setTimeout(() => {
        navigate('/trevas', { replace: true });
      }, 2600);
      return () => window.clearTimeout(timer);
    }
  }, [isAuthorized, navigate]);

  useEffect(() => {
    if (isAuthorized) {
      audioEngine.setMood('deep');
    }
  }, [isAuthorized]);

  // Entrance animations: slow, solemn reveal of eyes, title, and cylinders
  useEffect(() => {
    if (!isAuthorized) return;

    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const tumblersEl = tumblersRef.current;
    if (!containerEl || !tagEl || !titleEl || !tumblersEl) return;

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    tumblersEl.style.opacity = '0';
    tumblersEl.style.filter = 'blur(14px)';

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
        translateY: [20, 0],
        duration: 2600,
        ease: 'inOutCubic',
      }, 600)
      .add(tumblersEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 2400,
        ease: 'inOutCubic',
      }, 1200);
  }, [isAuthorized]);

  const rotateSlot = useCallback((index: number, direction: 1 | -1) => {
    if (isUnlocked) return;
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

  // Check Solution: NADA EXISTE
  useEffect(() => {
    if (!isAuthorized) return;
    const isSolved = combination.every((char, i) => char === TARGET_FULL[i]);
    if (isSolved && !isUnlocked) {
      setIsUnlocked(true);
      audioEngine.playStinger('success');
      audioEngine.setMood('strings');

      // ANIME.JS: TUDO COMEÇA A PARAR DE EXISTIR
      window.setTimeout(() => {
        const tagEl = tagRef.current;
        const titleEl = titleRef.current;
        const tumblersEl = tumblersRef.current;
        const eyesEl = eyesRef.current;

        const timeline = createTimeline();

        if (tumblersEl) {
          timeline.add(tumblersEl, {
            opacity: [1, 0],
            filter: ['blur(0px)', 'blur(24px)'],
            scale: [1, 0.92],
            duration: 2200,
            ease: 'inOutCubic',
          }, 0);
        }

        if (titleEl && tagEl) {
          timeline.add([titleEl, tagEl], {
            opacity: [1, 0],
            filter: ['blur(0px)', 'blur(28px)'],
            translateY: [0, -18],
            duration: 2600,
            ease: 'inOutCubic',
          }, 600);
        }

        if (eyesEl) {
          timeline.add(eyesEl, {
            opacity: [1, 0],
            filter: ['blur(0px)', 'blur(36px)'],
            scale: [1, 1.12],
            duration: 3400,
            ease: 'inOutCubic',
          }, 1400);
        }

        // After everything dissolves, show only "VOCÊ ESCAPOU." and https://github.com/daknii
        window.setTimeout(() => {
          setShowEpilogue(true);
        }, 4600);
      }, 1400);
    }
  }, [combination, isUnlocked, isAuthorized]);

  // Animate Epilogue reveal
  useEffect(() => {
    if (showEpilogue && epilogueRef.current) {
      animate(epilogueRef.current, {
        opacity: [0, 1],
        filter: ['blur(20px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 3400,
        ease: 'inOutCubic',
      });
    }
  }, [showEpilogue]);

  // Keyboard navigation & typing
  useEffect(() => {
    if (!isAuthorized || isUnlocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUnlocked) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        rotateSlot(activeSlot, -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        rotateSlot(activeSlot, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSlot((prev) => (prev - 1 + 10) % 10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveSlot((prev) => (prev + 1) % 10);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setCombination((prev) => {
          const next = [...prev];
          next[activeSlot] = 'X';
          return next;
        });
        setActiveSlot((prev) => Math.max(0, prev - 1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        audioEngine.playVaultTick();
        setCombination((prev) => {
          const next = [...prev];
          next[activeSlot] = char;
          return next;
        });
        setActiveSlot((prev) => (prev + 1) % 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlot, isUnlocked, rotateSlot, isAuthorized]);

  const getAdjacentChars = (char: string) => {
    const idx = ALPHABET.indexOf(char);
    const prev = ALPHABET[(idx - 1 + ALPHABET.length) % ALPHABET.length];
    const next = ALPHABET[(idx + 1) % ALPHABET.length];
    return { prev, next };
  };

  // UNAUTHORIZED: Direct URL Navigation is BLOCKED
  if (!isAuthorized) {
    return (
      <div className="relative w-screen h-screen min-h-screen bg-[#020102] text-[#e0d6d8] flex flex-col items-center justify-center px-6 text-center select-none">
        <div className="vignette-crimson pointer-events-none" aria-hidden="true" />
        <div className="noise-overlay pointer-events-none" aria-hidden="true" />

        <span className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase mb-3">
          ACESSO NEGADO
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-[0.25em] text-[#ff1a38] uppercase drop-shadow-[0_0_30px_rgba(255,26,56,0.6)]">
          O ABISMO REJEITA OS APRESSADOS.
        </h1>
        <p className="font-mono text-xs sm:text-sm text-[#8f8083] tracking-[0.14em] italic mt-4 max-w-md">
          Você tentou pisar onde a escuridão não permitiu. Retornando às trevas...
        </p>
      </div>
    );
  }

  const renderTumbler = (slotIdx: number) => {
    const char = combination[slotIdx];
    const { prev, next } = getAdjacentChars(char);
    const isActive = activeSlot === slotIdx;

    return (
      <div
        key={slotIdx}
        onClick={() => setActiveSlot(slotIdx)}
        className={`flex flex-col items-center cursor-pointer transition-transform duration-200 ${
          isActive ? 'scale-[1.05]' : 'opacity-80'
        }`}
        title={`Cilindro ${slotIdx + 1}`}
      >
        {/* Up arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveSlot(slotIdx);
            rotateSlot(slotIdx, -1);
          }}
          disabled={isUnlocked}
          className="w-8 sm:w-11 h-6 sm:h-7 flex items-center justify-center text-[#705055] hover:text-[#e6001a] disabled:opacity-20 transition-colors text-xs sm:text-sm"
          aria-label={`Girar cilindro ${slotIdx + 1} para cima`}
        >
          ▲
        </button>

        {/* Cylinder viewport (Floating cleanly, no cards, no big box) */}
        <div
          onWheel={(e) => {
            e.preventDefault();
            rotateSlot(slotIdx, e.deltaY > 0 ? 1 : -1);
          }}
          className={`relative w-9 sm:w-12 md:w-14 h-22 sm:h-28 rounded bg-[#090305] border flex flex-col items-center justify-center overflow-hidden transition-all duration-200 ${
            isActive
              ? 'border-[#ff1a38] shadow-[0_0_15px_rgba(255,26,56,0.5),inset_0_0_12px_rgba(153,0,17,0.3)]'
              : 'border-[#26050a]'
          }`}
        >
          {/* Previous letter */}
          <span className="font-mono text-xs sm:text-sm text-[#4d2f33] opacity-35 filter blur-[1px] select-none -translate-y-1">
            {prev}
          </span>

          {/* Active letter */}
          <span
            className={`font-mono text-xl sm:text-2xl md:text-3xl font-black select-none my-0.5 transition-all duration-150 ${
              isUnlocked
                ? 'text-[#ff1a38] drop-shadow-[0_0_18px_rgba(255,26,56,0.9)]'
                : 'text-[#ded3d5] drop-shadow-[0_0_8px_rgba(230,0,26,0.4)]'
            }`}
          >
            {char}
          </span>

          {/* Next letter */}
          <span className="font-mono text-xs sm:text-sm text-[#4d2f33] opacity-35 filter blur-[1px] select-none translate-y-1">
            {next}
          </span>

          {/* Center glass refraction line */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-7 sm:h-8 border-y border-[#ff1a38]/20 pointer-events-none" />
        </div>

        {/* Down arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveSlot(slotIdx);
            rotateSlot(slotIdx, 1);
          }}
          disabled={isUnlocked}
          className="w-8 sm:w-11 h-6 sm:h-7 flex items-center justify-center text-[#705055] hover:text-[#e6001a] disabled:opacity-20 transition-colors text-xs sm:text-sm"
          aria-label={`Girar cilindro ${slotIdx + 1} para baixo`}
        >
          ▼
        </button>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen min-h-screen bg-[#020102] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col items-center justify-center py-10 px-4 sm:px-8"
      style={{ opacity: 0 }}
      aria-label="Clímax — Limiar X"
    >
      {/* Film grain and dark cavern vignette */}
      <div className="vignette-crimson pointer-events-none" aria-hidden="true" />
      <div className="noise-overlay pointer-events-none" aria-hidden="true" />

      {/* 1. AUTHENTIC PANTHEREYES.TSX */}
      <div ref={eyesRef} className="relative z-10 my-2 sm:my-4 pointer-events-none select-none">
        <PantherEyes
          cursor={cursor}
          blinkState={{ leftEyeClosed: false, rightEyeClosed: false }}
          proximityState={isUnlocked ? 'INSIDE_TARGET' : 'FAR'}
          revealDelay={600}
        />
      </div>

      {/* 2. MAIN PUZZLE: ONLY EYES, TITLE, LIMIAR, AND TUMBLERS */}
      {!showEpilogue && (
        <main className="relative z-20 flex flex-col items-center text-center max-w-3xl w-full gap-4 sm:gap-6 my-auto">
          {/* Tag */}
          <span
            ref={tagRef}
            className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block pointer-events-none"
            style={{ opacity: 0 }}
          >
            LIMIAR X • O CLÍMAX
          </span>

          {/* Title */}
          <h1
            ref={titleRef}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.28em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
            style={{ opacity: 0 }}
          >
            ETERNO.
          </h1>

          {/* 3. PURE CYLINDERS FLOATING DIRECTLY IN THE DARK */}
          <div ref={tumblersRef} className="flex flex-col items-center mt-2 sm:mt-4" style={{ opacity: 0 }}>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 my-2">
              {/* Word 1: NADA (Slots 0..3) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[0, 1, 2, 3].map((slotIdx) => renderTumbler(slotIdx))}
              </div>

              {/* Discreet Divider */}
              <div className="flex items-center justify-center opacity-40 px-1">
                <span className="font-mono text-base text-[#ff1a38]">•</span>
              </div>

              {/* Word 2: EXISTE (Slots 4..9) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[4, 5, 6, 7, 8, 9].map((slotIdx) => renderTumbler(slotIdx))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 4. EPILOGUE: ONLY "VOCÊ ESCAPOU." AND URL "https://github.com/daknii" */}
      {showEpilogue && (
        <div
          ref={epilogueRef}
          className="relative z-30 flex flex-col items-center text-center max-w-xl my-auto opacity-0"
          style={{ willChange: 'opacity, filter, transform' }}
        >
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.35em] text-[#e0d6d8] drop-shadow-[0_0_35px_rgba(255,255,255,0.45)] uppercase">
            VOCÊ ESCAPOU.
          </h2>

          <a
            href="https://github.com/daknii"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs sm:text-sm text-[#8f8083] hover:text-[#ff1a38] tracking-[0.25em] transition-colors underline underline-offset-8 mt-6 cursor-pointer drop-shadow-[0_0_10px_rgba(255,26,56,0.3)]"
          >
            https://github.com/daknii
          </a>
        </div>
      )}
    </div>
  );
};
