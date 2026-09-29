import React, { useEffect, useRef } from 'react';
import { createTimeline } from 'animejs';

interface OpeningSequenceProps {
  onComplete: () => void;
}

/**
 * Component: OpeningSequence
 * Handles the eerie initial sequence:
 * 1. Screen begins pitch black (#050303)
 * 2. Large red text fades in slowly: "NÃO PISARÁS EM FALSO."
 * 3. Smaller gray text fades in smoothly: "Guarde a primeira letra, sempre."
 * 4. Slowly reveals the red eyes in the center using Anime.js v4 with deep cinematic pacing.
 */
export const OpeningSequence: React.FC<OpeningSequenceProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    if (!titleEl || !subtitleEl) return;

    // Check for user's reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '0.7';
      const timer = window.setTimeout(onComplete, 1200);
      return () => clearTimeout(timer);
    }

    // Set initial states
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(14px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(10px)';

    // Anime.js v4 timeline with slow, clean, atmospheric easing
    const timeline = createTimeline({
      onComplete: () => {
        onComplete();
      },
    });

    timeline
      // Step 1: Reveal large ominous red text slowly from the shadows
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 3200,
        ease: 'inOutCubic',
      }, 1000)
      // Step 2: Reveal cryptic gray subtext with a smooth fade
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
      className="absolute top-12 left-0 right-0 z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none"
      aria-live="polite"
    >
      <h1
        ref={titleRef}
        className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.25em] text-[#990011] drop-shadow-[0_0_25px_rgba(230,0,26,0.55)] uppercase"
      >
        NÃO PISARÁS EM FALSO.
      </h1>
      <p
        ref={subtitleRef}
        className="font-mono text-xs sm:text-sm tracking-[0.18em] text-[#6d6466] mt-3.5 uppercase italic"
      >
        Guarde a primeira letra, sempre.
      </p>
    </div>
  );
};
