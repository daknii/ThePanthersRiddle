import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import type { BlinkState, CursorPosition, ProximityState } from '../types/puzzle';

interface PantherEyesProps {
  cursor: CursorPosition;
  blinkState: BlinkState;
  proximityState: ProximityState;
  forceClosed?: boolean;
  onEyesRevealed?: () => void;
  revealDelay?: number;
}

export const PantherEyes: React.FC<PantherEyesProps> = ({
  cursor,
  blinkState,
  proximityState,
  forceClosed = false,
  onEyesRevealed,
  revealDelay = 3200,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<SVGGElement>(null);
  const rightPupilRef = useRef<SVGGElement>(null);

  // Subtle pupil tracking (only the black feline slit pupils shift, smoothly dampened)
  useEffect(() => {
    // Clamped subtle feline tracking (+-8px horizontal, +-4.5px vertical)
    const maxShiftX = 8;
    const maxShiftY = 4.5;
    const shiftX = cursor.normalizedX * maxShiftX;
    const shiftY = cursor.normalizedY * maxShiftY;

    if (leftPupilRef.current && rightPupilRef.current) {
      leftPupilRef.current.style.transform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`;
      rightPupilRef.current.style.transform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`;
    }
  }, [cursor.normalizedX, cursor.normalizedY]);

  // Initial slow atmospheric reveal using Anime.js v4 (majestic, slow fade-in)
  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        filter: ['blur(16px)', 'blur(0px)'],
        scale: [0.95, 1],
        duration: 3600,
        delay: revealDelay,
        ease: 'inOutCubic',
        onComplete: () => {
          if (onEyesRevealed) onEyesRevealed();
        },
      });
    }
  }, [onEyesRevealed, revealDelay]);

  const isInside = proximityState === 'INSIDE_TARGET';

  // Dynamic eyelid transition duration based on state
  const eyelidTransitionDuration = forceClosed ? '2200ms' : '220ms';
  const eyelidTimingFunction = forceClosed
    ? 'cubic-bezier(0.22, 1, 0.36, 1)'
    : 'cubic-bezier(0.25, 1, 0.5, 1)';

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center gap-10 sm:gap-16 md:gap-24 opacity-0 pointer-events-none select-none"
      style={{ willChange: 'opacity, filter' }}
      aria-hidden="true"
    >
      {/* Background Tapetum Subtle Eye Shine Glow */}
      <div
        className={`absolute inset-0 m-auto w-80 h-40 rounded-full bg-[#ff0026] blur-3xl pointer-events-none transition-all duration-700 ${
          isInside ? 'opacity-50 scale-135 animate-eye-signal-aura' : 'opacity-15 scale-100'
        }`}
      />

      {/* LEFT PANTHER EYE */}
      <div className="relative w-36 sm:w-44 md:w-52 h-20 sm:h-24 md:h-28">
        <svg
          viewBox="0 0 240 120"
          className={`w-full h-full overflow-visible transition-all duration-500 ${
            isInside
              ? 'drop-shadow-[0_0_35px_rgba(255,0,38,0.85)] drop-shadow-[0_0_70px_rgba(230,0,26,0.5)]'
              : 'drop-shadow-[0_0_25px_rgba(230,0,26,0.4)]'
          }`}
        >
          <defs>
            {/* Left Eye Cutout ClipPath (Sleek predatory feline shape) */}
            <clipPath id="left-panther-cutout">
              <path d="M 22,65 C 55,26 150,22 220,52 C 175,98 75,102 22,65 Z" />
            </clipPath>

            {/* Iris Radial Gradient (Deep blood-ruby to bright vermilion core) */}
            <radialGradient id="iris-grad-left" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="20%" stopColor="#ff1a38" />
              <stop offset="60%" stopColor="#990011" />
              <stop offset="85%" stopColor="#54000a" />
              <stop offset="100%" stopColor="#240004" />
            </radialGradient>

            {/* Red Signal Core Radial Gradient (Left) */}
            <radialGradient id="red-signal-grad-left" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#ff1a38" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#cc001a" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7a000d" stopOpacity="0" />
            </radialGradient>

            {/* Tapetum Lucidum Specular Sheen */}
            <linearGradient id="tapetum-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b81" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#990011" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Deep Black Panther Fur Contour */}
          <path
            d="M 18,65 C 52,24 152,20 224,51 C 178,101 72,105 18,65 Z"
            fill="#050303"
            stroke="#1c0307"
            strokeWidth="3"
          />

          {/* Eye Contents Clipped within Feline Cutout */}
          <g clipPath="url(#left-panther-cutout)">
            {/* Melanistic Dark Sclera */}
            <rect x="0" y="0" width="240" height="120" fill="#080305" />

            {/* Iris Base */}
            <ellipse
              cx="120"
              cy="60"
              rx="42"
              ry="38"
              fill="url(#iris-grad-left)"
              stroke="#1a0004"
              strokeWidth="2.5"
            />

            {/* Feline Iris Striations (Micro Collagen Fibers) */}
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

            {/* Tapetum Lucidum Overlay */}
            <ellipse
              cx="120"
              cy="60"
              rx="42"
              ry="38"
              fill="url(#tapetum-sheen)"
            />

            {/* SUBTLE TRACKING BLACK PUPIL */}
            <g
              ref={leftPupilRef}
              className="panther-pupil"
            >
              {/* Vertical Feline Slit Pupil */}
              <path
                d={
                  isInside
                    ? 'M 120,35 C 126,46 126,74 120,85 C 114,74 114,46 120,35 Z'
                    : 'M 120,32 C 129,45 129,75 120,88 C 111,75 111,45 120,32 Z'
                }
                fill="#000000"
              />
              {/* Deep Void Core */}
              <ellipse cx="120" cy="60" rx="3.5" ry="16" fill="#000000" />

              {/* Visual FX */}
              <g
                className={`red-signal-group transition-all duration-300 ${
                  isInside ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                }`}
                style={{ transformOrigin: '120px 60px' }}
              >
                {/* Sonar / Radar Waves */}
                <circle
                  cx="120"
                  cy="60"
                  r="8"
                  fill="none"
                  stroke="#ff1a38"
                  strokeWidth="1.5"
                  className={isInside ? 'animate-signal-ring-1' : ''}
                />
                <circle
                  cx="120"
                  cy="60"
                  r="16"
                  fill="none"
                  stroke="#ff002b"
                  strokeWidth="1.2"
                  className={isInside ? 'animate-signal-ring-2' : ''}
                />
                <circle
                  cx="120"
                  cy="60"
                  r="24"
                  fill="none"
                  stroke="#ff3355"
                  strokeWidth="0.8"
                  className={isInside ? 'animate-signal-ring-3' : ''}
                />

                {/* Radiant Pulsing Crimson Flare Core */}
                <circle
                  cx="120"
                  cy="60"
                  r="11"
                  fill="url(#red-signal-grad-left)"
                  className={isInside ? 'animate-signal-glow' : ''}
                />

                {/* Vertical Laser Slit Flare */}
                <line
                  x1="120"
                  y1="40"
                  x2="120"
                  y2="80"
                  stroke="#ff1a40"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={isInside ? 'animate-signal-slit' : ''}
                  style={{ filter: 'drop-shadow(0 0 6px #ff0033)' }}
                />

                {/* Brilliant Signal Core Light Center */}
                <circle
                  cx="120"
                  cy="60"
                  r="3.2"
                  fill="#ffffff"
                  style={{ filter: 'drop-shadow(0 0 8px #ff0033) drop-shadow(0 0 16px #ff0022)' }}
                />
                <circle
                  cx="120"
                  cy="60"
                  r="1.6"
                  fill="#ffe6ea"
                />
              </g>
            </g>

            {/* Specular Corneal Highlight (Moist reflection) */}
            <ellipse
              cx="110"
              cy="50"
              rx="5"
              ry="3.2"
              transform="rotate(-20 110 50)"
              fill="#ffffff"
              opacity="0.82"
            />
            <circle cx="132" cy="70" r="1.8" fill="#ffffff" opacity="0.45" />

            {/* FELINE EYELIDS (Controlled via blinkState.leftEyeClosed) */}
            <rect
              x="0"
              y="-120"
              width="240"
              height="120"
              fill="#050303"
              className="eyelid-rect"
              style={{
                transform: blinkState.leftEyeClosed ? 'translateY(60px)' : 'translateY(0px)',
                transitionProperty: 'transform',
                transitionDuration: eyelidTransitionDuration,
                transitionTimingFunction: eyelidTimingFunction,
              }}
            />
            <rect
              x="0"
              y="120"
              width="240"
              height="120"
              fill="#050303"
              className="eyelid-rect"
              style={{
                transform: blinkState.leftEyeClosed ? 'translateY(-60px)' : 'translateY(0px)',
                transitionProperty: 'transform',
                transitionDuration: eyelidTransitionDuration,
                transitionTimingFunction: eyelidTimingFunction,
              }}
            />
          </g>

          {/* Upper Eyelash & Dark Muscular Crease */}
          <path
            d="M 20,66 C 54,23 152,19 224,50"
            stroke="#120104"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 23,65 C 55,25 150,21 221,51"
            stroke="#4d0007"
            strokeWidth="1.2"
            fill="none"
            opacity="0.75"
          />
        </svg>
      </div>

      {/* RIGHT PANTHER EYE (Symmetrical predatory feline curve) */}
      <div className="relative w-36 sm:w-44 md:w-52 h-20 sm:h-24 md:h-28">
        <svg
          viewBox="0 0 240 120"
          className={`w-full h-full overflow-visible transition-all duration-500 ${
            isInside
              ? 'drop-shadow-[0_0_35px_rgba(255,0,38,0.85)] drop-shadow-[0_0_70px_rgba(230,0,26,0.5)]'
              : 'drop-shadow-[0_0_25px_rgba(230,0,26,0.4)]'
          }`}
        >
          <defs>
            {/* Right Eye Cutout ClipPath */}
            <clipPath id="right-panther-cutout">
              <path d="M 218,65 C 185,26 90,22 20,52 C 65,98 165,102 218,65 Z" />
            </clipPath>

            {/* Iris Radial Gradient Right */}
            <radialGradient id="iris-grad-right" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="20%" stopColor="#ff1a38" />
              <stop offset="60%" stopColor="#990011" />
              <stop offset="85%" stopColor="#54000a" />
              <stop offset="100%" stopColor="#240004" />
            </radialGradient>

            {/* Red Signal Core Radial Gradient (Right) */}
            <radialGradient id="red-signal-grad-right" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#ff1a38" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#cc001a" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7a000d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Deep Black Panther Fur Contour */}
          <path
            d="M 222,65 C 188,24 88,20 16,51 C 62,101 168,105 222,65 Z"
            fill="#050303"
            stroke="#1c0307"
            strokeWidth="3"
          />

          {/* Eye Contents Clipped */}
          <g clipPath="url(#right-panther-cutout)">
            {/* Melanistic Dark Sclera */}
            <rect x="0" y="0" width="240" height="120" fill="#080305" />

            {/* Iris Base */}
            <ellipse
              cx="120"
              cy="60"
              rx="42"
              ry="38"
              fill="url(#iris-grad-right)"
              stroke="#1a0004"
              strokeWidth="2.5"
            />

            {/* Feline Iris Striations */}
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

            {/* Tapetum Lucidum Overlay */}
            <ellipse
              cx="120"
              cy="60"
              rx="42"
              ry="38"
              fill="url(#tapetum-sheen)"
            />

            {/* SUBTLE TRACKING BLACK PUPIL */}
            <g
              ref={rightPupilRef}
              className="panther-pupil"
            >
              <path
                d={
                  isInside
                    ? 'M 120,35 C 126,46 126,74 120,85 C 114,74 114,46 120,35 Z'
                    : 'M 120,32 C 129,45 129,75 120,88 C 111,75 111,45 120,32 Z'
                }
                fill="#000000"
              />
              <ellipse cx="120" cy="60" rx="3.5" ry="16" fill="#000000" />

              {/* Visual FX */}
              <g
                className={`red-signal-group transition-all duration-300 ${
                  isInside ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
                }`}
                style={{ transformOrigin: '120px 60px' }}
              >
                {/* Sonar / Radar Waves */}
                <circle
                  cx="120"
                  cy="60"
                  r="8"
                  fill="none"
                  stroke="#ff1a38"
                  strokeWidth="1.5"
                  className={isInside ? 'animate-signal-ring-1' : ''}
                />
                <circle
                  cx="120"
                  cy="60"
                  r="16"
                  fill="none"
                  stroke="#ff002b"
                  strokeWidth="1.2"
                  className={isInside ? 'animate-signal-ring-2' : ''}
                />
                <circle
                  cx="120"
                  cy="60"
                  r="24"
                  fill="none"
                  stroke="#ff3355"
                  strokeWidth="0.8"
                  className={isInside ? 'animate-signal-ring-3' : ''}
                />

                {/* Radiant Pulsing Crimson Flare Core */}
                <circle
                  cx="120"
                  cy="60"
                  r="11"
                  fill="url(#red-signal-grad-right)"
                  className={isInside ? 'animate-signal-glow' : ''}
                />

                {/* Vertical Laser Slit Flare */}
                <line
                  x1="120"
                  y1="40"
                  x2="120"
                  y2="80"
                  stroke="#ff1a40"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={isInside ? 'animate-signal-slit' : ''}
                  style={{ filter: 'drop-shadow(0 0 6px #ff0033)' }}
                />

                {/* Brilliant Signal Core Light Center */}
                <circle
                  cx="120"
                  cy="60"
                  r="3.2"
                  fill="#ffffff"
                  style={{ filter: 'drop-shadow(0 0 8px #ff0033) drop-shadow(0 0 16px #ff0022)' }}
                />
                <circle
                  cx="120"
                  cy="60"
                  r="1.6"
                  fill="#ffe6ea"
                />
              </g>
            </g>

            {/* Specular Corneal Highlight */}
            <ellipse
              cx="110"
              cy="50"
              rx="5"
              ry="3.2"
              transform="rotate(-20 110 50)"
              fill="#ffffff"
              opacity="0.82"
            />
            <circle cx="132" cy="70" r="1.8" fill="#ffffff" opacity="0.45" />

            {/* FELINE EYELIDS (Controlled via blinkState.rightEyeClosed) */}
            <rect
              x="0"
              y="-120"
              width="240"
              height="120"
              fill="#050303"
              className="eyelid-rect"
              style={{
                transform: blinkState.rightEyeClosed ? 'translateY(60px)' : 'translateY(0px)',
                transitionProperty: 'transform',
                transitionDuration: eyelidTransitionDuration,
                transitionTimingFunction: eyelidTimingFunction,
              }}
            />
            <rect
              x="0"
              y="120"
              width="240"
              height="120"
              fill="#050303"
              className="eyelid-rect"
              style={{
                transform: blinkState.rightEyeClosed ? 'translateY(-60px)' : 'translateY(0px)',
                transitionProperty: 'transform',
                transitionDuration: eyelidTransitionDuration,
                transitionTimingFunction: eyelidTimingFunction,
              }}
            />
          </g>

          {/* Upper Eyelash & Dark Muscular Crease */}
          <path
            d="M 220,66 C 186,23 88,19 16,50"
            stroke="#120104"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 217,65 C 185,25 90,21 19,51"
            stroke="#4d0007"
            strokeWidth="1.2"
            fill="none"
            opacity="0.75"
          />
        </svg>
      </div>
    </div>
  );
};
