import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createTimeline } from 'animejs';
import { useNavigate } from 'react-router-dom';
import { audioEngine } from '../audio/audioEngine';
import { useCursorTracking } from '../hooks/useCursorTracking';

interface CluePoint {
  id: number;
  xPercent: number;
  yPercent: number;
  hint: string;
}

const CLUES: CluePoint[] = [
  {
    id: 1,
    xPercent: 24,
    yPercent: 38,
    hint: 'Pegadas apressadas na poeira. A presa corria em desespero.',
  },
  {
    id: 2,
    xPercent: 54,
    yPercent: 44,
    hint: 'Arranhões profundos na rocha. A fera cercava o caminho.',
  },
  {
    id: 3,
    xPercent: 46,
    yPercent: 68,
    hint: 'Gotas escuras no solo. O rastro cessa na fenda adiante.',
  },
];

// Target position of the hidden prey (Rabbit) in the alcove
const PREY_COORDS = { xPercent: 76, yPercent: 66 };

export const SilencioPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const cursor = useCursorTracking({ enabled: true });

  const [discoveredClues, setDiscoveredClues] = useState<Set<number>>(new Set());
  const [activeHint, setActiveHint] = useState<string>('');
  const [isHoveringClue, setIsHoveringClue] = useState<boolean>(false);
  const [isPreyLit, setIsPreyLit] = useState<boolean>(false);
  const [preyHoldTimer, setPreyHoldTimer] = useState<number>(0);
  const [isAmbushed, setIsAmbushed] = useState<boolean>(false);
  const [isFallenFlashlight, setIsFallenFlashlight] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const preyHoldStartRef = useRef<number | null>(null);
  const hasAmbushedRef = useRef<boolean>(false);

  // Initial atmosphere setup
  useEffect(() => {
    audioEngine.setMood('deep');
    audioEngine.setHeartbeat(0);
    return () => {
      audioEngine.setHeartbeat(0);
    };
  }, []);

  // Entrance animations matching atmospheric standard
  useEffect(() => {
    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
      return;
    }

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
        duration: 3000,
        ease: 'inOutCubic',
      }, 600)
      .add(subtitleEl, {
        opacity: [0, 0.9],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2600,
        ease: 'inOutCubic',
      }, 1600);
  }, []);

  // Check proximity for hover indicators
  useEffect(() => {
    if (isAmbushed) return;

    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    const LIGHT_RADIUS = 135;

    let nearUnclickedClue = false;

    CLUES.forEach((clue) => {
      const clueX = (clue.xPercent * width) / 100;
      const clueY = (clue.yPercent * height) / 100;
      const dist = Math.hypot(cursor.x - clueX, cursor.y - clueY);

      if (dist < LIGHT_RADIUS && !discoveredClues.has(clue.id)) {
        nearUnclickedClue = true;
      }
    });

    setIsHoveringClue(nearUnclickedClue);

    // Rabbit only exists if all 3 clues have been collected!
    const allCluesFound = discoveredClues.size === 3;
    if (allCluesFound) {
      const preyX = (PREY_COORDS.xPercent * width) / 100;
      const preyY = (PREY_COORDS.yPercent * height) / 100;
      const distToPrey = Math.hypot(cursor.x - preyX, cursor.y - preyY);
      setIsPreyLit(distToPrey < 125);
    } else {
      setIsPreyLit(false);
    }
  }, [cursor.x, cursor.y, discoveredClues, isAmbushed]);

  // Click on Clues
  const handleViewportClick = useCallback(() => {
    if (isAmbushed) return;

    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    const CLICK_RADIUS = 145;

    CLUES.forEach((clue) => {
      const clueX = (clue.xPercent * width) / 100;
      const clueY = (clue.yPercent * height) / 100;
      const dist = Math.hypot(cursor.x - clueX, cursor.y - clueY);

      if (dist < CLICK_RADIUS && !discoveredClues.has(clue.id)) {
        setDiscoveredClues((prev) => {
          const next = new Set(prev);
          next.add(clue.id);

          audioEngine.playVaultTick();
          setActiveHint(clue.hint);

          // Progressive tension audio
          if (next.size === 1) audioEngine.setHeartbeat(0.25);
          if (next.size === 2) audioEngine.setHeartbeat(0.5);
          if (next.size === 3) {
            audioEngine.setHeartbeat(0.75);
            audioEngine.playClick(2);
          }

          return next;
        });
      }
    });
  }, [cursor.x, cursor.y, discoveredClues, isAmbushed]);

  // Ambush Trigger: Hold light on prey for ~2.2 seconds!
  useEffect(() => {
    if (isAmbushed || hasAmbushedRef.current) return;

    let frameId: number;

    const checkPreyHold = () => {
      const now = performance.now();

      if (isPreyLit) {
        if (preyHoldStartRef.current === null) {
          preyHoldStartRef.current = now;
        }

        const elapsed = now - preyHoldStartRef.current;
        const progress = Math.min(1, elapsed / 2200);
        setPreyHoldTimer(progress);

        if (progress >= 1 && !hasAmbushedRef.current) {
          hasAmbushedRef.current = true;
          triggerAmbushSequence();
          return;
        }
      } else {
        preyHoldStartRef.current = null;
        setPreyHoldTimer(0);
      }

      frameId = requestAnimationFrame(checkPreyHold);
    };

    frameId = requestAnimationFrame(checkPreyHold);
    return () => cancelAnimationFrame(frameId);
  }, [isPreyLit, isAmbushed]);

  // Lethal Ambush Sequence with Slow, Understated Transition
  const triggerAmbushSequence = useCallback(() => {
    setIsAmbushed(true);
    audioEngine.setHeartbeat(0);
    audioEngine.playAmbushStrike();

    // Flashlight is dropped on the floor
    window.setTimeout(() => {
      setIsFallenFlashlight(true);
    }, 280);

    // Slow, lingering cinematic fade into pure black (4 seconds of aftermath)
    window.setTimeout(() => {
      setIsFadingOut(true);
    }, 4200);

    // Quiet transition to /trevas
    window.setTimeout(() => {
      navigate('/trevas');
    }, 6500);
  }, [navigate]);

  // Flashlight beam position: follows cursor or lies fallen on floor after ambush
  const lightX = isFallenFlashlight
    ? (PREY_COORDS.xPercent * (window.innerWidth || 1)) / 100 - 30
    : cursor.x;
  const lightY = isFallenFlashlight
    ? (PREY_COORDS.yPercent * (window.innerHeight || 1)) / 100 + 40
    : cursor.y;

  const allCluesCollected = discoveredClues.size === 3;

  return (
    <div
      ref={containerRef}
      onClick={handleViewportClick}
      className={`relative w-screen h-screen min-h-screen bg-[#030102] text-[#e0d6d8] overflow-hidden select-none cursor-none ${
        isAmbushed && !isFallenFlashlight ? 'animate-panther-screen-rumble' : ''
      }`}
      style={{ opacity: 0 }}
      aria-label="Silêncio — Limiar VIII"
    >
      {/* Film grain and dark cavern vignette */}
      <div className="vignette-crimson pointer-events-none" aria-hidden="true" />
      <div className="noise-overlay pointer-events-none" aria-hidden="true" />

      {/* Violent Ambush Red Flash */}
      {isAmbushed && !isFallenFlashlight && (
        <div className="fixed inset-0 z-40 bg-[#ff0026]/30 pointer-events-none animate-pulse" />
      )}

      {/* Header */}
      <header className="relative z-30 flex flex-col items-center text-center pt-8 px-6 pointer-events-none">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1"
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
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.14em] text-[#8f8083] italic max-w-lg leading-relaxed mt-1"
          style={{ opacity: 0 }}
        >
          Sussurros do abismo; investigue as marcas no escuro.
        </p>

        {/* Pure whispered hint text without any boxes or borders */}
        {activeHint && !isAmbushed && (
          <p className="font-mono text-xs sm:text-sm text-[#b8a2a5] tracking-widest italic mt-4 animate-fadeIn max-w-md">
            &ldquo;{activeHint}&rdquo;
          </p>
        )}
      </header>

      {/* DISCREET CLUE SYMBOLS ON THE SIDE (LEFT EDGE) */}
      <aside
        className="fixed left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none transition-opacity duration-700"
        style={{ opacity: isAmbushed ? 0 : 0.85 }}
        aria-label="Marcas da caçada encontradas"
      >
        {/* Symbol 1: Paw impression */}
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
            discoveredClues.has(1)
              ? 'border-[#990011] bg-[#1a0508] shadow-[0_0_12px_rgba(230,0,26,0.6)]'
              : 'border-[#24060a] bg-transparent opacity-30'
          }`}
          title="Pegadas na poeira"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#e6001a]">
            <ellipse cx="12" cy="14" rx="4" ry="5" />
            <circle cx="8" cy="8" r="1.8" />
            <circle cx="12" cy="6" r="1.8" />
            <circle cx="16" cy="8" r="1.8" />
          </svg>
        </div>

        {/* Symbol 2: Claw slash */}
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
            discoveredClues.has(2)
              ? 'border-[#990011] bg-[#1a0508] shadow-[0_0_12px_rgba(230,0,26,0.6)]'
              : 'border-[#24060a] bg-transparent opacity-30'
          }`}
          title="Garras na rocha"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current text-[#e6001a]" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="6" x2="6" y2="18" />
            <line x1="12" y1="5" x2="11" y2="19" />
            <line x1="16" y1="6" x2="16" y2="18" />
          </svg>
        </div>

        {/* Symbol 3: Droplet */}
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${
            discoveredClues.has(3)
              ? 'border-[#990011] bg-[#1a0508] shadow-[0_0_12px_rgba(230,0,26,0.6)]'
              : 'border-[#24060a] bg-transparent opacity-30'
          }`}
          title="Rastro de sangue"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#e6001a]">
            <path d="M 12,4 C 12,4 6,12 6,16 C 6,19.3 8.7,22 12,22 C 15.3,22 18,19.3 18,16 C 18,12 12,4 12,4 Z" />
          </svg>
        </div>
      </aside>

      {/* DYNAMIC FLASHLIGHT LIGHT CONE MASK */}
      <div
        className="fixed inset-0 z-10 pointer-events-none transition-all duration-100"
        style={{
          background: isFallenFlashlight
            ? `radial-gradient(ellipse 220px 140px at ${lightX}px ${lightY}px, rgba(255, 230, 210, 0.12) 0%, rgba(180, 20, 30, 0.05) 55%, rgba(3, 1, 2, 0.98) 85%, #030102 100%)`
            : `radial-gradient(circle 170px at ${lightX}px ${lightY}px, rgba(255, 240, 220, 0.15) 0%, rgba(180, 20, 30, 0.08) 60%, rgba(3, 1, 2, 0.98) 85%, #030102 100%)`,
        }}
      />

      {/* ENVIRONMENT IN THE SHADOWS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Faint trail lines between clues in valid SVG coordinates */}
        <svg className="w-full h-full pointer-events-none opacity-40" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <path
            d="M 240 380 Q 400 400 540 440 T 460 680 T 760 660"
            fill="none"
            stroke="#590c17"
            strokeWidth="2.5"
            strokeDasharray="6,8"
            className="transition-opacity duration-1000"
            style={{ opacity: discoveredClues.size > 0 ? 0.75 : 0.15 }}
          />
        </svg>

        {/* Clue 1: Panicked Rabbit Paw Tracks in Cavern Dust */}
        <div
          className="absolute pointer-events-none transition-all duration-500"
          style={{
            left: `${CLUES[0].xPercent}%`,
            top: `${CLUES[0].yPercent}%`,
            transform: 'translate(-50%, -50%)',
            opacity: discoveredClues.has(1) ? 1 : 0.85,
          }}
        >
          <div className="relative w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center">
            <svg viewBox="0 0 140 140" className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">
              {/* Dust halo */}
              <ellipse
                cx="70"
                cy="70"
                rx="52"
                ry="36"
                transform="rotate(25 70 70)"
                fill="#120407"
                stroke="#3d0d15"
                strokeWidth="1"
                strokeDasharray="3,4"
                className="opacity-70"
              />

              {/* Distant trailing paw prints */}
              <g transform="translate(36, 44) rotate(22)" opacity="0.65">
                <ellipse cx="0" cy="0" rx="3.5" ry="10" fill="#24060c" stroke="#54121b" strokeWidth="1" />
                <circle cx="-3" cy="-12" r="1.5" fill="#ff4d66" />
                <circle cx="0" cy="-13.5" r="1.5" fill="#ff4d66" />
                <circle cx="3" cy="-12" r="1.5" fill="#ff4d66" />

                <ellipse cx="14" cy="2" rx="3.5" ry="10" fill="#24060c" stroke="#54121b" strokeWidth="1" />
                <circle cx="11" cy="-10" r="1.5" fill="#ff4d66" />
                <circle cx="14" cy="-11.5" r="1.5" fill="#ff4d66" />
                <circle cx="17" cy="-10" r="1.5" fill="#ff4d66" />
              </g>

              {/* Fresh panicked bounding leap */}
              <g transform="translate(82, 78) rotate(30)">
                {/* Left elongated hind paw */}
                <ellipse cx="0" cy="0" rx="5" ry="13" fill="#2d080f" stroke="#801524" strokeWidth="1.2" />
                <ellipse cx="0" cy="2" rx="3.2" ry="7" fill="#140205" />
                <circle cx="-3.5" cy="-14" r="1.8" fill="#ff1a38" />
                <circle cx="0" cy="-16" r="1.8" fill="#ff1a38" />
                <circle cx="3.5" cy="-14" r="1.8" fill="#ff1a38" />

                {/* Right elongated hind paw */}
                <ellipse cx="18" cy="3" rx="5" ry="13" fill="#2d080f" stroke="#801524" strokeWidth="1.2" />
                <ellipse cx="18" cy="5" rx="3.2" ry="7" fill="#140205" />
                <circle cx="14.5" cy="-11" r="1.8" fill="#ff1a38" />
                <circle cx="18" cy="-13" r="1.8" fill="#ff1a38" />
                <circle cx="21.5" cy="-11" r="1.8" fill="#ff1a38" />

                {/* Small front paws planted into dust */}
                <circle cx="6" cy="18" r="2.8" fill="#3b0a13" stroke="#801524" strokeWidth="1" />
                <circle cx="14" cy="19" r="2.8" fill="#3b0a13" stroke="#801524" strokeWidth="1" />
              </g>
            </svg>

            {discoveredClues.has(1) && (
              <div className="absolute inset-0 rounded-full bg-[#ff0026]/12 animate-pulse pointer-events-none filter blur-md" />
            )}
          </div>
        </div>

        {/* Clue 2: Deep Claw Scratch Marks Ripped into Rock Face */}
        <div
          className="absolute pointer-events-none transition-all duration-500"
          style={{
            left: `${CLUES[1].xPercent}%`,
            top: `${CLUES[1].yPercent}%`,
            transform: 'translate(-50%, -50%)',
            opacity: discoveredClues.has(2) ? 1 : 0.9,
          }}
        >
          <div className="relative w-32 sm:w-40 h-32 sm:h-40 flex items-center justify-center">
            <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible drop-shadow-[0_0_18px_rgba(0,0,0,0.95)]">
              {/* Rock slab texture and silhouette */}
              <ellipse
                cx="80"
                cy="80"
                rx="68"
                ry="52"
                transform="rotate(-12 80 80)"
                fill="#0f0306"
                stroke="#2e0810"
                strokeWidth="1.5"
                className="opacity-80"
              />

              {/* Stress cracks radiating across stone slab */}
              <g stroke="#470915" strokeWidth="1" strokeLinecap="round" fill="none">
                <path d="M 36 74 L 18 64 M 126 86 L 146 96" />
                <path d="M 74 26 L 66 12 M 96 134 L 106 150" />
                <path d="M 50 110 L 38 126 M 110 52 L 126 38" />
              </g>

              {/* 4 VIOLENT PARALLEL CLAW GOUGES */}
              {/* Deep shadow trench */}
              <g stroke="#170104" strokeWidth="7" strokeLinecap="round" fill="none">
                <path d="M 36 38 C 44 60 54 86 66 122" />
                <path d="M 54 28 C 64 56 76 90 90 132" />
                <path d="M 74 30 C 84 58 96 92 110 126" />
                <path d="M 94 40 C 102 62 112 88 124 116" />
              </g>

              {/* Deep raked crimson tear */}
              <g stroke="#990011" strokeWidth="4.5" strokeLinecap="round" fill="none">
                <path d="M 37 39 C 45 61 55 87 66 121" />
                <path d="M 55 29 C 65 57 77 91 90 131" />
                <path d="M 75 31 C 85 59 97 93 110 125" />
                <path d="M 95 41 C 103 63 113 89 124 115" />
              </g>

              {/* Vivid scarlet core gouge */}
              <g stroke="#ff1a38" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 38 41 C 46 62 56 88 66 120" />
                <path d="M 56 31 C 66 58 78 92 90 130" />
                <path d="M 76 33 C 86 60 98 94 110 124" />
                <path d="M 96 43 C 104 64 114 90 124 114" />
              </g>

              {/* Specular razor claw glints / shattered rock highlights */}
              <g stroke="#ffe6ea" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.95">
                <path d="M 39 45 L 45 66 M 57 92 L 63 112" />
                <path d="M 57 35 L 65 62 M 79 96 L 87 122" />
                <path d="M 77 37 L 85 64 M 99 98 L 107 118" />
                <path d="M 97 47 L 103 68 M 115 94 L 121 110" />
              </g>

              {/* Pulverized rock chips & blood splatter at stroke terminals */}
              <circle cx="68" cy="126" r="1.8" fill="#ff1a38" />
              <circle cx="93" cy="136" r="2.2" fill="#ffd6dc" />
              <circle cx="114" cy="130" r="1.8" fill="#990011" />
              <circle cx="127" cy="120" r="1.4" fill="#ff1a38" />
            </svg>

            {discoveredClues.has(2) && (
              <div className="absolute inset-0 rounded-full bg-[#ff0026]/15 animate-pulse pointer-events-none filter blur-md" />
            )}
          </div>
        </div>

        {/* Clue 3: Blood Droplets & Splatter Leading Toward Crevice */}
        <div
          className="absolute pointer-events-none transition-all duration-500"
          style={{
            left: `${CLUES[2].xPercent}%`,
            top: `${CLUES[2].yPercent}%`,
            transform: 'translate(-50%, -50%)',
            opacity: discoveredClues.has(3) ? 1 : 0.85,
          }}
        >
          <div className="relative w-28 sm:w-32 h-28 sm:h-32 flex items-center justify-center">
            <svg viewBox="0 0 140 140" className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">
              {/* Stone fissure */}
              <path d="M 22 80 Q 62 70 122 75" stroke="#2b060d" strokeWidth="1.5" fill="none" />

              {/* Primary heavy blood pool */}
              <ellipse cx="50" cy="65" rx="14" ry="11" fill="#6e000d" />
              <ellipse cx="49" cy="64" rx="11" ry="8" fill="#a80015" />
              <ellipse cx="48" cy="63" rx="7" ry="5" fill="#e6001a" />
              <circle cx="45" cy="61" r="2.4" fill="#ffffff" opacity="0.85" />

              {/* Trailing droplets streaking toward right alcove */}
              <circle cx="75" cy="70" r="5" fill="#8f0012" />
              <circle cx="74" cy="69" r="3.5" fill="#d40019" />
              <circle cx="73" cy="68" r="1.2" fill="#ffffff" opacity="0.8" />

              <circle cx="95" cy="74" r="3.5" fill="#7a0010" />
              <circle cx="94.5" cy="73.5" r="2.2" fill="#ba0016" />

              <circle cx="112" cy="76" r="2.2" fill="#66000e" />
              <circle cx="124" cy="77" r="1.5" fill="#4a000a" />

              {/* Fine satellite splatter droplets */}
              <circle cx="36" cy="54" r="1.5" fill="#990011" />
              <circle cx="42" cy="78" r="1.8" fill="#990011" />
              <circle cx="58" cy="55" r="1.2" fill="#c70018" />
              <circle cx="63" cy="76" r="1.5" fill="#c70018" />
            </svg>

            {discoveredClues.has(3) && (
              <div className="absolute inset-0 rounded-full bg-[#ff0026]/12 animate-pulse pointer-events-none filter blur-md" />
            )}
          </div>
        </div>

        {/* THE PREY (RABBIT): ONLY SPAWNS IF ALL 3 CLUES ARE FOUND */}
        {allCluesCollected && !isAmbushed && (
          <div
            className="absolute transition-opacity duration-300 pointer-events-none"
            style={{
              left: `${PREY_COORDS.xPercent}%`,
              top: `${PREY_COORDS.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              opacity: isPreyLit ? 0.98 : 0.05,
            }}
          >
            {/* Subtle eyeshine in the shadows behind the prey as tension peaks */}
            {isPreyLit && preyHoldTimer > 0.4 && (
              <div className="absolute -top-12 -right-10 flex gap-6 opacity-80 animate-pulse pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-[#ff0026] shadow-[0_0_8px_#ff0026]" />
                <div className="w-2 h-2 rounded-full bg-[#ff0026] shadow-[0_0_8px_#ff0026]" />
              </div>
            )}

            {/* Wild Rabbit Silhouette */}
            <svg
              viewBox="0 0 100 80"
              className="w-20 sm:w-24 h-16 sm:h-20 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)] animate-pulse"
              style={{ animationDuration: '1.2s' }}
            >
              <ellipse cx="62" cy="18" rx="4" ry="16" transform="rotate(15 62 18)" fill="#291a1e" stroke="#4a2a32" strokeWidth="0.8" />
              <ellipse cx="56" cy="20" rx="3.5" ry="15" transform="rotate(-5 56 20)" fill="#1f1316" stroke="#4a2a32" strokeWidth="0.8" />
              <ellipse cx="62" cy="19" rx="1.8" ry="11" transform="rotate(15 62 19)" fill="#54242d" opacity="0.6" />
              <ellipse cx="58" cy="36" rx="12" ry="10" transform="rotate(10 58 36)" fill="#24171a" stroke="#3b1f25" strokeWidth="0.8" />
              <ellipse cx="38" cy="48" rx="22" ry="17" fill="#1c1214" stroke="#3b1f25" strokeWidth="0.8" />
              <ellipse cx="26" cy="52" rx="14" ry="12" fill="#24171a" />
              <circle cx="63" cy="34" r="2.2" fill="#050102" />
              <circle cx="63.5" cy="33.5" r="0.9" fill="#ffffff" style={{ filter: 'drop-shadow(0 0 2px #ffffff)' }} />
              <ellipse cx="68" cy="38" rx="3" ry="2.5" fill="#170c0e" />
            </svg>
          </div>
        )}

        {/* PANTHER AMBUSH STRIKE: Violent lunging panther shadow */}
        {isAmbushed && !isFallenFlashlight && (
          <div
            className="absolute z-30 pointer-events-none animate-fadeIn"
            style={{
              left: `${PREY_COORDS.xPercent}%`,
              top: `${PREY_COORDS.yPercent}%`,
              transform: 'translate(-40%, -60%) scale(1.6)',
            }}
          >
            <svg viewBox="0 0 240 180" className="w-64 sm:w-80 h-48 sm:h-60 overflow-visible">
              <path
                d="M 10,10 C 60,30 140,50 200,140 C 180,150 140,110 110,95 C 80,140 50,150 10,120 Z"
                fill="#000000"
                stroke="#ff0026"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 30px #ff0026)' }}
              />
              <path d="M 170,120 Q 190,145 205,155" stroke="#ffffff" strokeWidth="2.5" fill="none" />
              <path d="M 178,115 Q 198,140 215,150" stroke="#ffffff" strokeWidth="2.5" fill="none" />
              <path d="M 186,110 Q 206,135 225,145" stroke="#ffffff" strokeWidth="2.5" fill="none" />
              <circle cx="155" cy="72" r="3.5" fill="#ff0026" style={{ filter: 'drop-shadow(0 0 8px #ff0026)' }} />
              <circle cx="170" cy="70" r="3.5" fill="#ff0026" style={{ filter: 'drop-shadow(0 0 8px #ff0026)' }} />
            </svg>
          </div>
        )}

        {/* AFTERMATH: Subtle scratches & empty dark floor in the dying light (no text, no banners) */}
        {isFallenFlashlight && (
          <div
            className="absolute z-20 pointer-events-none flex flex-col items-center animate-fadeIn"
            style={{
              left: `${PREY_COORDS.xPercent}%`,
              top: `${PREY_COORDS.yPercent}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <svg viewBox="0 0 160 80" className="w-28 sm:w-36 h-16 sm:h-20 opacity-70">
              <path d="M 20,15 L 140,65" stroke="#7a000d" strokeWidth="3" strokeLinecap="round" />
              <path d="M 35,10 L 150,55" stroke="#990011" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="45" cy="50" r="3" fill="#54000a" />
              <circle cx="85" cy="68" r="2.5" fill="#7a000d" />
            </svg>
          </div>
        )}
      </div>

      {/* HANDHELD FLASHLIGHT CURSOR BEAD & INTERACTIVE RETICLE */}
      {!isFallenFlashlight && (
        <div
          className="fixed pointer-events-none z-30 transition-transform duration-75 flex flex-col items-center"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className={`rounded-full transition-all duration-300 ${
              isHoveringClue
                ? 'w-8 h-8 bg-[#ff1a38]/20 border-2 border-[#ff3355] shadow-[0_0_22px_#ff0026] scale-125'
                : isPreyLit
                ? 'w-8 h-8 bg-[#ffebeb]/20 border border-[#ff4d66]/60 shadow-[0_0_25px_#ff0026]'
                : 'w-5 h-5 bg-[#ffffff]/15 border border-[#ffffff]/25 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
            }`}
          />
          {isHoveringClue && (
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] text-[#ff4d66] uppercase mt-2 drop-shadow-[0_0_8px_#ff0026] animate-pulse">
              [ INVESTIGAR ]
            </span>
          )}
        </div>
      )}

      {/* SLOW CINEMATIC BLACKOUT TRANSITION */}
      <div
        className={`fixed inset-0 z-50 bg-[#000000] pointer-events-none transition-opacity duration-2500 ease-in-out ${
          isFadingOut ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </div>
  );
};
