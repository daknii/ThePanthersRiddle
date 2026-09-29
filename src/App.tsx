import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState } from './types/puzzle';
import { PUZZLE_CONFIG } from './config/puzzleConfig';
import { useCursorTracking } from './hooks/useCursorTracking';
import { useProximityCalculation } from './hooks/useProximityCalculation';
import { useBlinkManager } from './hooks/useBlinkManager';
import { OpeningSequence } from './components/OpeningSequence';
import { PantherEyes } from './components/PantherEyes';
import { FailureScreen } from './components/FailureScreen';
import { Page2 } from './components/Page2';
import { Page3 } from './components/Page3';
import { AccessibleTracker } from './components/AccessibleTracker';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('OPENING');
  const [isEyesRevealed, setIsEyesRevealed] = useState(false);
  const [forceEyesClosed, setForceEyesClosed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const attemptMadeRef = useRef(false);

  // 1. Cursor Tracking (Mouse, Touch, Keyboard)
  const cursor = useCursorTracking({
    enabled: gameState === 'PLAYING' || gameState === 'OPENING',
  });

  // 2. Proximity Calculation relative to invisible target
  const { proximityState } = useProximityCalculation({
    cursor,
    config: PUZZLE_CONFIG,
  });

  // 3. Blink State Management based on proximity levels
  const { blinkState } = useBlinkManager({
    proximityState,
    forceClosed: forceEyesClosed,
    enabled: isEyesRevealed && gameState === 'PLAYING',
  });

  // 4. Click Validation (Strictly ONE attempt allowed, slow and clean transition)
  const handleAttempt = useCallback((clickX: number, clickY: number) => {
    // Only allow clicking when the puzzle is active and ready
    if (gameState !== 'PLAYING' || attemptMadeRef.current) return;
    attemptMadeRef.current = true;

    // Determine hit status at point of click
    const targetPixelCoords = {
      x: (window.innerWidth * PUZZLE_CONFIG.xPercent) / 100,
      y: (window.innerHeight * PUZZLE_CONFIG.yPercent) / 100,
    };
    const distanceToTarget = Math.hypot(
      clickX - targetPixelCoords.x,
      clickY - targetPixelCoords.y
    );
    const isSuccess = distanceToTarget <= PUZZLE_CONFIG.hitRadiusPx;

    // Trigger slow, clean transition:
    // 1. Panther eyes slowly close over 2200ms
    // 2. Fullscreen blackout fades in over 2400ms
    setForceEyesClosed(true);
    setIsFadingOut(true);
    setGameState('RESOLVING');

    // 3. After the slow close and stillness in pure darkness, transition state
    const transitionDelay = 2600; // ms

    if (isSuccess) {
      window.setTimeout(() => {
        setGameState('SUCCESS');
      }, transitionDelay);
    } else {
      window.setTimeout(() => {
        setGameState('FAILURE');
      }, transitionDelay);
    }
  }, [gameState]);

  // Viewport Click Handler
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleAttempt(e.clientX, e.clientY);
  };

  // Touch End Handler for mobile
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.changedTouches.length > 0) {
      handleAttempt(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  };

  // Keyboard attempt fallback (Space or Enter key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAttempt(cursor.x, cursor.y);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, cursor.x, cursor.y, handleAttempt]);

  // Transition from opening sequence
  const handleOpeningComplete = useCallback(() => {
    setGameState('PLAYING');
  }, []);

  const handleEyesRevealed = useCallback(() => {
    setIsEyesRevealed(true);
  }, []);

  // If at Page 2, render Page2 component
  if (gameState === 'SUCCESS') {
    return (
      <Page2
        onComplete={() => setGameState('PAGE3')}
        onDeath={() => setGameState('FAILURE')}
      />
    );
  }

  // If at Page 3, render Page3 component
  if (gameState === 'PAGE3') {
    return <Page3 />;
  }

  // Terminal FAILURE state: standalone death screen (no Page 1 remount)
  if (gameState === 'FAILURE') {
    return (
      <div className="relative w-screen h-screen bg-[#050303] overflow-hidden select-none">
        <div className="vignette-crimson" aria-hidden="true" />
        <div className="noise-overlay" aria-hidden="true" />
        <FailureScreen />
      </div>
    );
  }

  return (
    <div
      onClick={handleViewportClick}
      onTouchEnd={handleTouchEnd}
      className="relative w-screen h-screen bg-[#050303] text-[#e0d6d8] overflow-hidden select-none cursor-default flex items-center justify-center"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Subtle Atmospheric Layers */}
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Opening Cryptic Text Header */}
      <OpeningSequence onComplete={handleOpeningComplete} />

      {/* Red Panther Eyes (Central Mystery Element) */}
      <main className="relative z-20 flex items-center justify-center w-full h-full">
        <PantherEyes
          cursor={cursor}
          blinkState={blinkState}
          proximityState={proximityState}
          forceClosed={forceEyesClosed}
          onEyesRevealed={handleEyesRevealed}
        />
      </main>

      {/* Fullscreen Resolution Fade Overlay for clean, slow transition */}
      <div
        className={`resolution-fade-overlay ${isFadingOut ? 'active' : ''}`}
        aria-hidden="true"
      />

      {/* Accessible Alternative for Keyboard & Screen Reader Users */}
      <AccessibleTracker
        proximityState={proximityState}
        onAttemptAction={() => handleAttempt(cursor.x, cursor.y)}
        enabled={gameState === 'PLAYING'}
      />


      {/* Debug Indicator (ONLY active if explicitly enabled in puzzleConfig.ts) */}
      {PUZZLE_CONFIG.debugMode && (
        <div
          className="fixed pointer-events-none border border-red-500 rounded-full z-50 opacity-40 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${PUZZLE_CONFIG.xPercent}%`,
            top: `${PUZZLE_CONFIG.yPercent}%`,
            width: `${PUZZLE_CONFIG.hitRadiusPx * 2}px`,
            height: `${PUZZLE_CONFIG.hitRadiusPx * 2}px`,
          }}
        />
      )}
    </div>
  );
};

export default App;
