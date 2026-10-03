import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createTimeline } from 'animejs';
import { useNavigate } from 'react-router-dom';
import { audioEngine } from '../audio/audioEngine';

const TARGET_FREQ = 88.8;
const MIN_FREQ = 80.0;
const MAX_FREQ = 100.0;
const TOLERANCE = 0.28;
const HOLD_DURATION_MS = 1800;

export const IrisPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const eyesContainerRef = useRef<HTMLDivElement>(null);
  const tunerRef = useRef<HTMLDivElement>(null);
  const scaleTrackRef = useRef<HTMLDivElement>(null);

  const [frequency, setFrequency] = useState<number>(82.4);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isRoaring, setIsRoaring] = useState<boolean>(false);
  const [isFadingToNext, setIsFadingToNext] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const holdStartRef = useRef<number | null>(null);
  const hasTriggeredRoarRef = useRef<boolean>(false);
  const staticGainRef = useRef<GainNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Entrance animations matching atmospheric standard
  useEffect(() => {
    audioEngine.setMood('hunt');

    const containerEl = containerRef.current;
    const tagEl = tagRef.current;
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    const eyesEl = eyesContainerRef.current;
    const tunerEl = tunerRef.current;
    if (!containerEl || !tagEl || !titleEl || !subtitleEl || !eyesEl || !tunerEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      containerEl.style.opacity = '1';
      tagEl.style.opacity = '1';
      titleEl.style.opacity = '1';
      subtitleEl.style.opacity = '1';
      eyesEl.style.opacity = '1';
      tunerEl.style.opacity = '1';
      return;
    }

    containerEl.style.opacity = '0';
    tagEl.style.opacity = '0';
    titleEl.style.opacity = '0';
    titleEl.style.filter = 'blur(16px)';
    subtitleEl.style.opacity = '0';
    subtitleEl.style.filter = 'blur(12px)';
    eyesEl.style.opacity = '0';
    eyesEl.style.filter = 'blur(18px)';
    tunerEl.style.opacity = '0';
    tunerEl.style.filter = 'blur(14px)';

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
      }, 200)
      .add(titleEl, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        translateY: [24, 0],
        duration: 2600,
        ease: 'inOutCubic',
      }, 400)
      .add(subtitleEl, {
        opacity: [0, 0.9],
        filter: ['blur(12px)', 'blur(0px)'],
        translateY: [12, 0],
        duration: 2200,
        ease: 'inOutCubic',
      }, 1400)
      .add(eyesEl, {
        opacity: [0, 1],
        filter: ['blur(18px)', 'blur(0px)'],
        scale: [0.96, 1],
        duration: 3200,
        ease: 'inOutCubic',
      }, 1800)
      .add(tunerEl, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        translateY: [16, 0],
        duration: 2400,
        ease: 'inOutCubic',
      }, 2400);
  }, []);

  // Web Audio Local Radio Static & Harmonic Synthesizer
  useEffect(() => {
    let ctx: AudioContext | null = null;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // 1. Static White/Pink Noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1700;
      noiseFilter.Q.value = 1.3;

      const staticGain = ctx.createGain();
      staticGain.gain.value = 0.08;
      staticGainRef.current = staticGain;

      whiteNoise.connect(noiseFilter).connect(staticGain).connect(ctx.destination);
      whiteNoise.start();

      // 2. Resonant Target Harmonic Tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 176.0;

      const humGain = ctx.createGain();
      humGain.gain.value = 0;
      humGainRef.current = humGain;

      osc.connect(humGain).connect(ctx.destination);
      osc.start();
    } catch {
      // AudioContext unavailable or restricted
    }

    return () => {
      if (ctx && ctx.state !== 'closed') {
        void ctx.close();
      }
    };
  }, []);

  // Dynamic Audio Balance based on Frequency Offset
  useEffect(() => {
    const diff = Math.abs(frequency - TARGET_FREQ);
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    if (isRoaring) {
      if (staticGainRef.current) staticGainRef.current.gain.setTargetAtTime(0, now, 0.05);
      if (humGainRef.current) humGainRef.current.gain.setTargetAtTime(0, now, 0.05);
      return;
    }

    if (diff <= TOLERANCE) {
      if (staticGainRef.current) staticGainRef.current.gain.setTargetAtTime(0.005, now, 0.1);
      if (humGainRef.current) humGainRef.current.gain.setTargetAtTime(0.12, now, 0.15);
    } else if (diff <= 2.5) {
      const proximity = 1 - diff / 2.5;
      if (staticGainRef.current) staticGainRef.current.gain.setTargetAtTime(0.03 + (1 - proximity) * 0.06, now, 0.1);
      if (humGainRef.current) humGainRef.current.gain.setTargetAtTime(proximity * 0.05, now, 0.1);
    } else {
      if (staticGainRef.current) staticGainRef.current.gain.setTargetAtTime(0.09, now, 0.15);
      if (humGainRef.current) humGainRef.current.gain.setTargetAtTime(0, now, 0.1);
    }
  }, [frequency, isRoaring]);

  // Sustained Hold: Must hold on target frequency
  useEffect(() => {
    if (isRoaring || hasTriggeredRoarRef.current) return;

    const diff = Math.abs(frequency - TARGET_FREQ);
    const isLocked = diff <= TOLERANCE;

    let animationFrameId: number;

    const tick = () => {
      const now = performance.now();

      if (isLocked) {
        if (holdStartRef.current === null) {
          holdStartRef.current = now;
        }

        const elapsed = now - holdStartRef.current;
        const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
        setHoldProgress(progress);

        if (progress >= 1 && !hasTriggeredRoarRef.current) {
          hasTriggeredRoarRef.current = true;
          triggerPantherRoar();
          return;
        }
      } else {
        holdStartRef.current = null;
        setHoldProgress((prev) => Math.max(0, prev - 0.06));
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [frequency, isRoaring]);

  // Climax Roar Execution
  const triggerPantherRoar = useCallback(() => {
    setIsRoaring(true);
    audioEngine.playPantherRoar();

    window.setTimeout(() => {
      setIsFadingToNext(true);
    }, 2200);

    window.setTimeout(() => {
      navigate('/silencio');
    }, 3200);
  }, [navigate]);

  const handleFrequencyChange = useCallback((newVal: number) => {
    if (isRoaring) return;
    const clamped = Math.max(MIN_FREQ, Math.min(MAX_FREQ, Math.round(newVal * 10) / 10));
    setFrequency(clamped);
  }, [isRoaring]);

  const updateFromPointer = useCallback((clientX: number) => {
    const track = scaleTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetFreq = MIN_FREQ + ratio * (MAX_FREQ - MIN_FREQ);
    handleFrequencyChange(targetFreq);
  }, [handleFrequencyChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRoaring) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleFrequencyChange(frequency - 0.1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleFrequencyChange(frequency + 0.1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frequency, isRoaring, handleFrequencyChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isRoaring) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isRoaring) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // safe
    }
  };

  // Eyelid offset: 1 = closed (60px), 0 = wide open (0px)
  const eyelidPercent = isRoaring ? 0 : 1 - holdProgress * 0.95;
  const upperEyelidShift = eyelidPercent * 60;
  const lowerEyelidShift = -eyelidPercent * 60;

  // Iris glow intensity
  const irisGlowOpacity = isRoaring ? 1 : Math.max(0.08, holdProgress * 0.85);

  return (
    <div
      ref={containerRef}
      className={`relative w-screen min-h-screen bg-[#050303] text-[#e0d6d8] overflow-y-auto overflow-x-hidden select-none cursor-default flex flex-col items-center justify-center py-8 px-4 sm:px-8 ${
        isRoaring ? 'animate-panther-screen-rumble' : ''
      }`}
      style={{ opacity: 0 }}
      aria-label="Íris — Limiar VII"
    >
      {/* Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Screen flash on roar */}
      {isRoaring && (
        <div className="fixed inset-0 z-40 bg-[#ff0026]/20 pointer-events-none animate-pulse" />
      )}

      {/* Main Container */}
      <main className="relative z-20 flex flex-col items-center text-center max-w-2xl w-full gap-5 sm:gap-6 my-auto">
        <span
          ref={tagRef}
          className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-1 pointer-events-none"
          style={{ opacity: 0 }}
        >
          LIMIAR VII • FASE 7
        </span>

        <h1
          ref={titleRef}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.28em] text-[#990011] drop-shadow-[0_0_35px_rgba(230,0,26,0.6)] uppercase"
          style={{ opacity: 0 }}
        >
          ÍRIS.
        </h1>

        <p
          ref={subtitleRef}
          className="font-mono text-xs sm:text-sm md:text-base tracking-[0.12em] text-[#a89a9c] italic max-w-lg leading-relaxed select-text"
          style={{ opacity: 0 }}
        >
          No silêncio das frequências perdidas, a fera aguarda a sintonia.
        </p>

        {/* AUTHENTIC PANTHER EYES (IDENTICAL TO PHASE 1, NO CARTOON HEAD) */}
        <div
          ref={eyesContainerRef}
          className="relative flex items-center justify-center gap-10 sm:gap-16 md:gap-20 my-4 sm:my-6 pointer-events-none select-none"
          style={{ opacity: 0 }}
          aria-hidden="true"
        >
          {/* Background Crimson Tapetum Glow */}
          <div
            className="absolute inset-0 m-auto w-72 h-36 rounded-full bg-[#ff0026] blur-3xl pointer-events-none transition-all duration-500"
            style={{
              opacity: isRoaring ? 0.95 : irisGlowOpacity * 0.45,
              transform: isRoaring ? 'scale(1.5)' : `scale(${1 + holdProgress * 0.3})`,
            }}
          />

          {/* LEFT PANTHER EYE */}
          <div className="relative w-32 sm:w-40 md:w-48 h-18 sm:h-22 md:h-26">
            <svg
              viewBox="0 0 240 120"
              className={`w-full h-full overflow-visible transition-all duration-300 ${
                isRoaring
                  ? 'drop-shadow-[0_0_40px_rgba(255,0,38,0.95)] drop-shadow-[0_0_80px_rgba(230,0,26,0.6)]'
                  : 'drop-shadow-[0_0_20px_rgba(230,0,26,0.35)]'
              }`}
            >
              <defs>
                <clipPath id="iris-left-panther-cutout">
                  <path d="M 22,65 C 55,26 150,22 220,52 C 175,98 75,102 22,65 Z" />
                </clipPath>

                <radialGradient id="iris-grad-left-p7" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="20%" stopColor="#ff1a38" />
                  <stop offset="60%" stopColor="#990011" />
                  <stop offset="85%" stopColor="#54000a" />
                  <stop offset="100%" stopColor="#240004" />
                </radialGradient>

                <radialGradient id="red-signal-grad-left-p7" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="25%" stopColor="#ff1a38" stopOpacity="0.95" />
                  <stop offset="65%" stopColor="#cc001a" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#7a000d" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="tapetum-sheen-left-p7" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b81" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#990011" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Feline Contour Fur */}
              <path
                d="M 18,65 C 52,24 152,20 224,51 C 178,101 72,105 18,65 Z"
                fill="#050303"
                stroke="#1c0307"
                strokeWidth="3"
              />

              <g clipPath="url(#iris-left-panther-cutout)">
                <rect x="0" y="0" width="240" height="120" fill="#080305" />

                {/* Iris Base */}
                <ellipse
                  cx="120"
                  cy="60"
                  rx="42"
                  ry="38"
                  fill="url(#iris-grad-left-p7)"
                  stroke="#1a0004"
                  strokeWidth="2.5"
                />

                {/* Iris Striations */}
                <g opacity="0.45" stroke="#ff4d66" strokeWidth="0.75">
                  <line x1="120" y1="60" x2="84" y2="45" />
                  <line x1="120" y1="60" x2="90" y2="35" />
                  <line x1="120" y1="60" x2="105" y2="28" />
                  <line x1="120" y1="60" x2="120" y2="24" />
                  <line x1="120" y1="60" x2="135" y2="28" />
                  <line x1="120" y1="60" x2="150" y2="35" />
                  <line x1="120" y1="60" x2="156" y2="45" />
                  <line x1="120" y1="60" x2="158" y2="60" />
                  <line x1="120" y1="60" x2="154" y2="75" />
                  <line x1="120" y1="60" x2="145" y2="86" />
                  <line x1="120" y1="60" x2="130" y2="92" />
                  <line x1="120" y1="60" x2="110" y2="92" />
                  <line x1="120" y1="60" x2="95" y2="86" />
                  <line x1="120" y1="60" x2="86" y2="75" />
                  <line x1="120" y1="60" x2="82" y2="60" />
                </g>

                {/* Tapetum Sheen */}
                <ellipse
                  cx="120"
                  cy="60"
                  rx="42"
                  ry="38"
                  fill="url(#tapetum-sheen-left-p7)"
                />

                {/* Pupil */}
                <g>
                  <path
                    d={
                      isRoaring
                        ? 'M 120,38 C 123,48 123,72 120,82 C 117,72 117,48 120,38 Z'
                        : 'M 120,34 C 127,46 127,74 120,86 C 113,74 113,46 120,34 Z'
                    }
                    fill="#000000"
                  />
                  <ellipse cx="120" cy="60" rx="3.5" ry="16" fill="#000000" />

                  {/* Sonar flare when roaring */}
                  {isRoaring && (
                    <g style={{ transformOrigin: '120px 60px' }}>
                      <circle cx="120" cy="60" r="14" fill="none" stroke="#ff002b" strokeWidth="1.5" />
                      <circle cx="120" cy="60" r="22" fill="none" stroke="#ff3355" strokeWidth="1" />
                      <circle cx="120" cy="60" r="10" fill="url(#red-signal-grad-left-p7)" />
                    </g>
                  )}
                </g>

                {/* Specular Highlight */}
                <ellipse cx="110" cy="50" rx="5" ry="3.2" transform="rotate(-20 110 50)" fill="#ffffff" opacity="0.85" />

                {/* EYELIDS */}
                <rect
                  x="0"
                  y="-120"
                  width="240"
                  height="120"
                  fill="#050303"
                  style={{
                    transform: `translateY(${upperEyelidShift}px)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                />
                <rect
                  x="0"
                  y="120"
                  width="240"
                  height="120"
                  fill="#050303"
                  style={{
                    transform: `translateY(${lowerEyelidShift}px)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                />
              </g>
            </svg>
          </div>

          {/* RIGHT PANTHER EYE */}
          <div className="relative w-32 sm:w-40 md:w-48 h-18 sm:h-22 md:h-26">
            <svg
              viewBox="0 0 240 120"
              className={`w-full h-full overflow-visible transition-all duration-300 ${
                isRoaring
                  ? 'drop-shadow-[0_0_40px_rgba(255,0,38,0.95)] drop-shadow-[0_0_80px_rgba(230,0,26,0.6)]'
                  : 'drop-shadow-[0_0_20px_rgba(230,0,26,0.35)]'
              }`}
            >
              <defs>
                <clipPath id="iris-right-panther-cutout">
                  <path d="M 218,65 C 185,26 90,22 20,52 C 65,98 165,102 218,65 Z" />
                </clipPath>

                <radialGradient id="iris-grad-right-p7" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="20%" stopColor="#ff1a38" />
                  <stop offset="60%" stopColor="#990011" />
                  <stop offset="85%" stopColor="#54000a" />
                  <stop offset="100%" stopColor="#240004" />
                </radialGradient>

                <radialGradient id="red-signal-grad-right-p7" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="25%" stopColor="#ff1a38" stopOpacity="0.95" />
                  <stop offset="65%" stopColor="#cc001a" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#7a000d" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="tapetum-sheen-right-p7" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b81" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#990011" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Feline Contour Fur */}
              <path
                d="M 222,65 C 188,24 88,20 16,51 C 62,101 168,105 222,65 Z"
                fill="#050303"
                stroke="#1c0307"
                strokeWidth="3"
              />

              <g clipPath="url(#iris-right-panther-cutout)">
                <rect x="0" y="0" width="240" height="120" fill="#080305" />

                {/* Iris Base */}
                <ellipse
                  cx="120"
                  cy="60"
                  rx="42"
                  ry="38"
                  fill="url(#iris-grad-right-p7)"
                  stroke="#1a0004"
                  strokeWidth="2.5"
                />

                {/* Iris Striations */}
                <g opacity="0.45" stroke="#ff4d66" strokeWidth="0.75">
                  <line x1="120" y1="60" x2="84" y2="45" />
                  <line x1="120" y1="60" x2="90" y2="35" />
                  <line x1="120" y1="60" x2="105" y2="28" />
                  <line x1="120" y1="60" x2="120" y2="24" />
                  <line x1="120" y1="60" x2="135" y2="28" />
                  <line x1="120" y1="60" x2="150" y2="35" />
                  <line x1="120" y1="60" x2="156" y2="45" />
                  <line x1="120" y1="60" x2="158" y2="60" />
                  <line x1="120" y1="60" x2="154" y2="75" />
                  <line x1="120" y1="60" x2="145" y2="86" />
                  <line x1="120" y1="60" x2="130" y2="92" />
                  <line x1="120" y1="60" x2="110" y2="92" />
                  <line x1="120" y1="60" x2="95" y2="86" />
                  <line x1="120" y1="60" x2="86" y2="75" />
                  <line x1="120" y1="60" x2="82" y2="60" />
                </g>

                {/* Tapetum Sheen */}
                <ellipse
                  cx="120"
                  cy="60"
                  rx="42"
                  ry="38"
                  fill="url(#tapetum-sheen-right-p7)"
                />

                {/* Pupil */}
                <g>
                  <path
                    d={
                      isRoaring
                        ? 'M 120,38 C 123,48 123,72 120,82 C 117,72 117,48 120,38 Z'
                        : 'M 120,34 C 127,46 127,74 120,86 C 113,74 113,46 120,34 Z'
                    }
                    fill="#000000"
                  />
                  <ellipse cx="120" cy="60" rx="3.5" ry="16" fill="#000000" />

                  {/* Sonar flare when roaring */}
                  {isRoaring && (
                    <g style={{ transformOrigin: '120px 60px' }}>
                      <circle cx="120" cy="60" r="14" fill="none" stroke="#ff002b" strokeWidth="1.5" />
                      <circle cx="120" cy="60" r="22" fill="none" stroke="#ff3355" strokeWidth="1" />
                      <circle cx="120" cy="60" r="10" fill="url(#red-signal-grad-right-p7)" />
                    </g>
                  )}
                </g>

                {/* Specular Highlight */}
                <ellipse cx="110" cy="50" rx="5" ry="3.2" transform="rotate(-20 110 50)" fill="#ffffff" opacity="0.85" />

                {/* EYELIDS */}
                <rect
                  x="0"
                  y="-120"
                  width="240"
                  height="120"
                  fill="#050303"
                  style={{
                    transform: `translateY(${upperEyelidShift}px)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                />
                <rect
                  x="0"
                  y="120"
                  width="240"
                  height="120"
                  fill="#050303"
                  style={{
                    transform: `translateY(${lowerEyelidShift}px)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                />
              </g>
            </svg>
          </div>
        </div>

        {/* MINIMALIST RADIO FREQUENCY SLIDER */}
        <div
          ref={tunerRef}
          onWheel={(e) => {
            e.preventDefault();
            handleFrequencyChange(frequency + (e.deltaY > 0 ? -0.1 : 0.1));
          }}
          className="relative max-w-md w-full flex flex-col items-center mt-2 select-none"
          style={{ opacity: 0 }}
        >
          {/* Frequency Display */}
          <div className="flex items-baseline gap-1.5 mb-5 pointer-events-none">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-[#e6001a] tracking-widest drop-shadow-[0_0_15px_rgba(230,0,26,0.8)]">
              {frequency.toFixed(1)}
            </span>
            <span className="font-mono text-xs text-[#8f7579] tracking-widest uppercase">
              MHz
            </span>
          </div>

          {/* Minimalist Interactive Slider Line */}
          <div
            ref={scaleTrackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full h-10 flex items-center cursor-ew-resize touch-none"
            title="Arraste para sintonizar ou use a rodinha do mouse / setas do teclado"
          >
            {/* Horizontal Track Line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4a1017] to-transparent relative">
              {/* Subtle ticks */}
              {[80, 85, 90, 95, 100].map((val) => (
                <div
                  key={val}
                  className="absolute top-1/2 -translate-y-1/2 w-[1px] h-2 bg-[#4a1017] pointer-events-none"
                  style={{
                    left: `${((val - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Glowing Red Needle / Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
              style={{
                left: `${((frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * 100}%`,
              }}
            >
              <div
                className={`w-3.5 h-3.5 -ml-[7px] rounded-full border border-[#ff4d66] bg-[#e6001a] transition-all duration-200 ${
                  holdProgress > 0
                    ? 'scale-125 shadow-[0_0_20px_#ff0026]'
                    : 'shadow-[0_0_10px_#ff0026]'
                }`}
              />
            </div>
          </div>

          {/* Minimal Resonance Charge Line */}
          <div className="w-36 sm:w-48 h-[2px] bg-[#1a0508] rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-[#990011] to-[#ff1a38] transition-all duration-75 shadow-[0_0_10px_#e6001a]"
              style={{ width: `${holdProgress * 100}%` }}
            />
          </div>
        </div>
      </main>

      {/* Cinematic Blackout Transition to Next Page */}
      <div
        className={`fixed inset-0 z-50 bg-[#050303] pointer-events-none transition-opacity duration-1000 ease-in-out ${
          isFadingToNext ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </div>
  );
};
