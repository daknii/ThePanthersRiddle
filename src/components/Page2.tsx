import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animate, createTimeline } from 'animejs';

interface Page2Props {
  onComplete: () => void;
  onDeath: () => void;
}

const BINARY_CIPHER_TEXT =
  "00100010 01001001 00100000 01101001 01110010 01111000 01100101 01110011 00100000 01101001 01111001 00100000 01100111 01101100 01101001 01101011 01111001 01101001 01101101 00100000 01100101 00100000 01110100 01110011 01110110 01111000 01100101 00101100 00100000 01100110 01100101 01111000 01101101 00100000 00110011 00100000 01111010 01101001 01100100 01101001 01110111 00100000 01101001 00100000 01110010 01100101 01110011 00100000 01101010 01111001 01101101 00100000 01100101 01111001 01101001 01110010 01101000 01101101 01101000 01110011 00101100 00100000 01101001 01110010 01111001 01110011 00100000 01100110 01100101 01111001 01101101 00100000 01110010 01100101 00100000 01110100 01110011 01110110 01111000 01100101 00100000 00110111 00100000 01111010 01101001 01100100 01101001 01110111 00101100 00100000 01101001 00100000 01100101 00100000 01110100 01110011 01110110 01111000 01100101 00100000 01110111 01101001 00100000 01100101 01100110 01110110 01101101 01111001 00101110 00100010";

// Maximum delay allowed between consecutive clicks (in milliseconds).
// Any pause longer than 750ms resets the counter back to 0.
const MAX_CONSECUTIVE_CLICK_INTERVAL_MS = 750;

/**
 * Component: Page2
 * Puzzle Page 2:
 * - Upper title in red: "ATÉ 0S e 1S."
 * - Subtitle below: "Nem Tiberius Claudius Caesar sabia binários."
 * - Below that, almost transparent monospace binary string (selectable).
 *
 * Dynamics:
 * - User must click 7 CONSECUTIVE times quickly (within 750ms between clicks).
 * - After the 3rd click, the screen becomes noticeably redder.
 * - On exactly 7 clicks: Waits a brief moment to ensure player stops knocking, then unlocks Page 3.
 * - IF THE USER CLICKS 8 TIMES (overshoot / spam): Immediate DEATH (transitions to failure screen).
 * - Hesitations (>750ms) reset the count to 0 and the red glow fades away.
 */
export const Page2: React.FC<Page2Props> = ({ onComplete, onDeath }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDying, setIsDying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const binaryRef = useRef<HTMLParagraphElement>(null);
  const resetTimerRef = useRef<number | null>(null);
  const page3TimerRef = useRef<number | null>(null);

  // deadRef: once true, ALL callbacks (onComplete / onDeath) are permanently blocked.
  // This prevents the race condition where the page3 fade animation's onComplete
  // fires AFTER the death animation already triggered onDeath.
  const deadRef = useRef(false);

  // Store the page3 fade animation instance so it can be cancelled on death
  const page3AnimationRef = useRef<ReturnType<typeof animate> | null>(null);

  // Initial slow, atmospheric fade-in
  useEffect(() => {
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const binaryEl = binaryRef.current;
    if (!titleEl || !subtitleEl || !binaryEl) return;

    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(14px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(10px)';
    binaryEl.style.opacity = '0';
    binaryEl.style.filter = 'blur(8px)';

    const timeline = createTimeline();

    timeline
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 2800,
        ease: 'inOutCubic',
      }, 400)
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

  // Handle rapid consecutive clicks (must be quick, <= 750ms interval)
  const handlePagePointerDown = useCallback((e: React.PointerEvent) => {
    // Only accept primary button (left mouse button or touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isTransitioning || isDying) return;

    setClickCount((prev) => {
      const nextCount = prev + 1;

      // Clear existing reset timeout
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }

      // CRITICAL RULE: If the user presses 8 times -> DEATH!
      if (nextCount >= 8) {
        // Mark as dead FIRST — this blocks ALL future callbacks
        deadRef.current = true;

        // Cancel the pending Page 3 unlock timer
        if (page3TimerRef.current) {
          window.clearTimeout(page3TimerRef.current);
          page3TimerRef.current = null;
        }

        // Cancel the page3 fade animation if it's already running
        if (page3AnimationRef.current) {
          page3AnimationRef.current.cancel();
          page3AnimationRef.current = null;
        }

        setIsDying(true);

        // Harsh death screen fade / collapse with Anime.js v4
        if (containerRef.current) {
          animate(containerRef.current, {
            opacity: [1, 0],
            filter: ['blur(0px)', 'blur(20px)'],
            scale: [1, 1.04],
            duration: 1200,
            ease: 'inOutCubic',
            onComplete: () => {
              if (!deadRef.current) return; // should always be true here
              onDeath();
            },
          });
        } else {
          onDeath();
        }
        return 8;
      }

      // If exactly 7 rapid consecutive clicks reached:
      if (nextCount === 7) {
        // Arm the unlock transition. We wait 1200ms to verify the player STOPS at 7.
        // If they click an 8th time within this window, they die!
        page3TimerRef.current = window.setTimeout(() => {
          // Guard: if the player died during the wait, do NOT proceed
          if (deadRef.current) return;

          setIsTransitioning(true);

          if (containerRef.current) {
            page3AnimationRef.current = animate(containerRef.current, {
              opacity: [1, 0],
              filter: ['blur(0px)', 'blur(16px)'],
              duration: 2800,
              ease: 'inOutCubic',
              onComplete: () => {
                // Guard: if the player died during the animation, do NOT proceed
                if (deadRef.current) return;
                onComplete();
              },
            });
          } else {
            if (!deadRef.current) {
              onComplete();
            }
          }
        }, 1200);

        return 7;
      }

      // Inactivity timeout: player MUST click rapidly.
      // If pause is longer than 750ms, streak is broken and resets to 0.
      resetTimerRef.current = window.setTimeout(() => {
        setClickCount(0);
      }, MAX_CONSECUTIVE_CLICK_INTERVAL_MS);

      return nextCount;
    });
  }, [isTransitioning, isDying, onComplete, onDeath]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      if (page3TimerRef.current) {
        window.clearTimeout(page3TimerRef.current);
      }
      if (page3AnimationRef.current) {
        page3AnimationRef.current.cancel();
      }
    };
  }, []);

  // Redness intensity calculation:
  // Clicks 0-2: 0 (pure dark void)
  // Click 3: 0.38 (starts visibly redder)
  // Click 4: 0.54
  // Click 5: 0.72
  // Click 6: 0.88
  // Click 7: 1.0 (peak crimson before transition)
  // Click 8+: Instant violent blood death
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
      onPointerDown={handlePagePointerDown}
      className={`relative w-screen h-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col justify-between items-center py-12 px-6 sm:px-12 touch-manipulation ${
        isDying ? 'bg-[#3b0007]' : ''
      }`}
      style={{ willChange: 'opacity, filter, transform' }}
      aria-label="Página 2 do Enigma"
    >
      {/* Subtle Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Dynamic Redness Wash Layer (Activates after 3rd click, intensifies up to 7th, fades if reset) */}
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

      {/* Header Section: Title and Subtitle */}
      <header className="relative z-20 flex flex-col items-center text-center mt-4 sm:mt-8 max-w-2xl pointer-events-none">
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

      {/* Middle Section: Monospace Binary Cipher Block (selectable text) */}
      <main className="relative z-30 max-w-3xl w-full my-auto flex flex-col items-center justify-center px-4 pointer-events-auto">
        <p
          ref={binaryRef}
          onPointerDown={(e) => {
            // Stop propagation so clicking or dragging to select text does not trigger consecutive knock count
            e.stopPropagation();
          }}
          className="binary-selectable font-mono text-[10.5px] sm:text-xs md:text-[13px] leading-relaxed tracking-[0.22em] text-center break-words text-[#d9c7cb]/30 select-text"
          style={{
            textShadow: '0 0 12px rgba(230, 0, 26, 0.15)',
            wordBreak: 'break-word',
          }}
          title="Texto binário selecionável (arraste para copiar)"
        >
          {BINARY_CIPHER_TEXT}
        </p>
      </main>

      {/* Bottom Area (Clean, zero spoiler indicators) */}
      <footer className="relative z-20 text-center mb-2 pointer-events-none" />
    </div>
  );
};
