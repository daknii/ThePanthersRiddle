import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animate, createTimeline } from 'animejs';

interface Page2Props {
  onComplete: () => void;
  onDeath: () => void;
}

const BINARY_CIPHER_TEXT =
  "00100010 01001001 00100000 01101001 01110010 01111000 01100101 01110011 00100000 01101001 01111001 00100000 01100111 01101100 01101001 01101011 01111001 01101001 01101101 00100000 01100101 00100000 01110100 01110011 01110110 01111000 01100101 00101100 00100000 01100110 01100101 01111000 01101101 00100000 00110011 00100000 01111010 01101001 01100100 01101001 01110111 00100000 01101001 00100000 01110010 01100101 01110011 00100000 01101010 01111001 01101101 00100000 01100101 01111000 01101001 01110010 01101000 01101101 01101000 01110011 00101100 00100000 01101001 01110010 01111000 01100101 01110011 00100000 01100110 01100101 01111000 01101101 00100000 01110010 01100101 00100000 01110100 01110011 01110110 01111000 01100101 00100000 00110111 00100000 01111010 01101001 01100100 01101001 01110111 00101100 00100000 01101001 00100000 01100101 00100000 01110100 01110011 01110110 01111000 01100101 00100000 01110111 01101001 00100000 01100101 01100110 01110110 01101101 01111001 00101110 00100010";

const MAX_INTERVAL_MS = 750;

export const Page2: React.FC<Page2Props> = ({ onComplete, onDeath }) => {
  const [clickCount, setClickCount] = useState(0);
  const clickCountRef = useRef(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDying, setIsDying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const binaryRef = useRef<HTMLParagraphElement>(null);
  const resetTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const binaryEl = binaryRef.current;
    if (!tagEl || !titleEl || !subtitleEl || !binaryEl) return;

    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(14px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(10px)';
    binaryEl.style.opacity = '0';
    binaryEl.style.filter = 'blur(8px)';

    const timeline = createTimeline();

    timeline
      .add(tagEl, {
        opacity: [0, 0.9],
        duration: 2000,
        ease: 'inOutCubic',
      }, 200)
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 500)
      .add(subtitleEl, {
        opacity: [0, 0.85],
        filter: ['blur(10px)', 'blur(0px)'],
        translateY: [10, 0],
        duration: 2400,
        ease: 'inOutCubic',
      }, 1600)
      .add(binaryEl, {
        opacity: [0, 0.32],
        filter: ['blur(8px)', 'blur(0px)'],
        duration: 2800,
        ease: 'inOutCubic',
      }, 2600);
  }, []);

  const triggerSuccess = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsTransitioning(true);

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [1, 0],
        filter: ['blur(0px)', 'blur(18px)'],
        duration: 1000,
        ease: 'inOutCubic',
        onComplete: () => {
          onComplete();
        },
      });

      // Reliable timeout fallback in case of animation interruption
      window.setTimeout(() => {
        onComplete();
      }, 1100);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const triggerDeath = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsDying(true);

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [1, 0],
        filter: ['blur(0px)', 'blur(20px)'],
        scale: [1, 1.04],
        duration: 1000,
        ease: 'inOutCubic',
        onComplete: () => {
          onDeath();
        },
      });

      window.setTimeout(() => {
        onDeath();
      }, 1100);
    } else {
      onDeath();
    }
  }, [onDeath]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isTransitioning || isDying || completedRef.current) return;

    // Restart the inactivity window on every click: the sequence only resets
    // if MAX_INTERVAL_MS passes since the *last* click.
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    // Side effects are kept outside the setState updater (updaters may run
    // twice in StrictMode, which previously leaked an uncleared timer).
    const nextCount = clickCountRef.current + 1;
    clickCountRef.current = nextCount;
    setClickCount(nextCount);

    if (nextCount >= 8) {
      triggerDeath();
      return;
    }

    if (nextCount === 7) {
      triggerSuccess();
      return;
    }

    resetTimerRef.current = window.setTimeout(() => {
      resetTimerRef.current = null;
      if (!completedRef.current) {
        clickCountRef.current = 0;
        setClickCount(0);
      }
    }, MAX_INTERVAL_MS);
  }, [isTransitioning, isDying, triggerDeath, triggerSuccess]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const getRedIntensity = () => {
    if (clickCount < 3) return 0;
    if (clickCount === 3) return 0.38;
    if (clickCount === 4) return 0.54;
    if (clickCount === 5) return 0.72;
    if (clickCount === 6) return 0.88;
    return 1.0;
  };

  const redIntensity = getRedIntensity();

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`relative w-screen h-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col justify-between items-center py-12 px-6 sm:px-12 touch-manipulation ${isDying ? 'bg-[#3b0007]' : ''
        }`}
      style={{ willChange: 'opacity, filter, transform' }}
      aria-label="Página 2 do Enigma"
    >
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <div
        className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-500 ease-out"
        style={{
          opacity: redIntensity,
          background: isDying
            ? 'radial-gradient(circle at center, rgba(255, 0, 40, 0.85) 0%, rgba(160, 0, 25, 0.95) 60%, rgba(5, 0, 2, 1) 100%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(200, 0, 35, 0.5) 0%, rgba(110, 0, 22, 0.7) 55%, rgba(15, 1, 4, 0.96) 100%)',
        }}
        aria-hidden="true"
      />

      <header className="relative z-20 flex flex-col items-center text-center mt-4 sm:mt-8 max-w-2xl pointer-events-none">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-3 pointer-events-none"
        >
          LIMIAR II • FASE 2
        </span>
        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[0.22em] text-[#990011] drop-shadow-[0_0_25px_rgba(230,0,26,0.55)] uppercase mb-4"
        >
          ATÉ 0S e 1S.
        </h1>
        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.16em] text-[#8f8083] uppercase italic"
        >
          Nem Tiberius Claudius Caesar sabia binários.
        </p>
      </header>

      <main className="relative z-30 max-w-3xl w-full my-auto flex flex-col items-center justify-center px-4">
        <p
          ref={binaryRef}
          className="binary-selectable font-mono text-[10.5px] sm:text-xs md:text-[13px] leading-relaxed tracking-[0.22em] text-center break-words text-[#d9c7cb]/30 select-text"
          style={{
            textShadow: '0 0 12px rgba(230, 0, 26, 0.15)',
            wordBreak: 'break-word',
          }}
          title="Texto binário selecionável"
        >
          {BINARY_CIPHER_TEXT}
        </p>
      </main>

      <footer className="relative z-20 text-center mb-2 pointer-events-none" />
    </div>
  );
};
