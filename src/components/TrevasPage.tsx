import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createTimeline } from 'animejs';
import { useNavigate } from 'react-router-dom';
import { audioEngine } from '../audio/audioEngine';

declare global {
  interface Window {
    eterno?: () => string;
  }
}

export const TrevasPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const hasTriggeredRef = useRef<boolean>(false);

  // Initial atmosphere setup
  useEffect(() => {
    audioEngine.setMood('deep');
    audioEngine.setHeartbeat(0.3);
    return () => {
      audioEngine.setHeartbeat(0);
    };
  }, []);

  // Entrance animations: slow, haunting fade-in
  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl) return;

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(12px)';

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
        duration: 2800,
        ease: 'inOutCubic',
      }, 600)
      .add(subtitleEl, {
        opacity: [0, 0.9],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2400,
        ease: 'inOutCubic',
      }, 1400);
  }, []);

  // Trigger unlock when eterno() is executed in console
  const triggerUnlock = useCallback(() => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    setIsUnlocked(true);

    audioEngine.playPantherRoar();
    audioEngine.playStinger('success');
    audioEngine.setHeartbeat(0);

    window.setTimeout(() => {
      setIsFadingOut(true);
    }, 800);

    window.setTimeout(() => {
      navigate('/climax');
    }, 2200);
  }, [navigate]);

  // Expose the eterno() function to the browser DevTools console
  useEffect(() => {
    // Print atmospheric ARG message in console
    console.log(
      '%c[TREVAS]\n%cA luz foi devorada. O que você procura não está mais desenhado na tela.\n\n%c> eterno()\n',
      'color: #ff1a38; font-size: 15px; font-weight: 900; font-family: monospace;',
      'color: #b8a2a5; font-size: 13px; font-family: monospace;',
      'color: #ffffff; background: #990011; padding: 4px 10px; border-radius: 4px; font-size: 14px; font-weight: bold; font-family: monospace;'
    );

    window.eterno = () => {
      sessionStorage.setItem('trevas_unlocked', 'true');
      console.log(
        '%c[ECO] O chamado foi atendido. A fera te aguarda no limiar final...',
        'color: #ff1a38; font-size: 14px; font-weight: bold; font-family: monospace;'
      );
      triggerUnlock();
      return 'O abismo responde ao seu chamado...';
    };

    return () => {
      delete window.eterno;
    };
  }, [triggerUnlock]);

  return (
    <div
      ref={containerRef}
      className={`relative w-screen h-screen min-h-screen bg-[#030102] text-[#e0d6d8] overflow-hidden select-none cursor-default flex flex-col items-center justify-center px-6 text-center ${
        isUnlocked ? 'animate-panther-screen-rumble' : ''
      }`}
      style={{ opacity: 0 }}
      aria-label="Trevas — Limiar IX"
    >
      {/* Film grain and dark cavern vignette */}
      <div className="vignette-crimson pointer-events-none" aria-hidden="true" />
      <div className="noise-overlay pointer-events-none" aria-hidden="true" />

      {/* Violent Red Pulse on Unlock */}
      {isUnlocked && (
        <div className="fixed inset-0 z-40 bg-[#ff0026]/30 pointer-events-none animate-pulse" />
      )}

      {/* PURE MINIMALIST TYPOGRAPHY — NO HINTS ON SCREEN */}
      <main className="relative z-20 flex flex-col items-center max-w-xl gap-5 my-auto">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1"
          style={{ opacity: 0 }}
        >
          LIMIAR IX • FASE 9
        </span>

        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.28em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          TREVAS.
        </h1>

        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.16em] text-[#8f8083] italic max-w-lg leading-relaxed select-text"
          style={{ opacity: 0 }}
        >
          O ataque engoliu sua luz. Resta apenas o abismo.
        </p>

        {isUnlocked && (
          <p className="font-mono text-xs sm:text-sm text-[#ff4d66] tracking-[0.22em] uppercase italic mt-4 animate-fadeIn">
            &ldquo;O abismo respondeu. A fera se aproxima...&rdquo;
          </p>
        )}
      </main>

      {/* SLOW CINEMATIC BLACKOUT */}
      <div
        className={`fixed inset-0 z-50 bg-[#000000] pointer-events-none transition-opacity duration-1500 ease-in-out ${
          isFadingOut ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </div>
  );
};
