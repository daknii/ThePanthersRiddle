import React, { useState, useCallback, useRef, useEffect, Suspense, lazy } from 'react';
import type { GameState } from './types/puzzle';
import { PUZZLE_CONFIG } from './config/puzzleConfig';
import { useCursorTracking } from './hooks/useCursorTracking';
import { useProximityCalculation } from './hooks/useProximityCalculation';
import { useBlinkManager } from './hooks/useBlinkManager';
import { OpeningSequence } from './components/OpeningSequence';
import { PantherEyes } from './components/PantherEyes';
import { FailureScreen } from './components/FailureScreen';
import { AccessibleTracker } from './components/AccessibleTracker';

const Page2 = lazy(() => import('./components/Page2').then(m => ({ default: m.Page2 })));
const Page3 = lazy(() => import('./components/Page3').then(m => ({ default: m.Page3 })));

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('OPENING');
  const [isEyesRevealed, setIsEyesRevealed] = useState(false);
  const [forceEyesClosed, setForceEyesClosed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const attemptMadeRef = useRef(false);

  const cursor = useCursorTracking({
    enabled: gameState === 'PLAYING' || gameState === 'OPENING',
  });

  const { proximityState, distance } = useProximityCalculation({
    cursor,
    config: PUZZLE_CONFIG,
  });

  const { blinkState } = useBlinkManager({
    proximityState,
    distance,
    forceClosed: forceEyesClosed,
    enabled: isEyesRevealed && gameState === 'PLAYING',
  });

  const handleAttempt = useCallback((clickX: number, clickY: number) => {
    if (gameState !== 'PLAYING' || attemptMadeRef.current) return;
    attemptMadeRef.current = true;

    const targetPixelCoords = {
      x: (window.innerWidth * PUZZLE_CONFIG.xPercent) / 100,
      y: (window.innerHeight * PUZZLE_CONFIG.yPercent) / 100,
    };
    const distanceToTarget = Math.hypot(
      clickX - targetPixelCoords.x,
      clickY - targetPixelCoords.y
    );
    const isSuccess = distanceToTarget <= PUZZLE_CONFIG.hitRadiusPx;

    setForceEyesClosed(true);
    setIsFadingOut(true);
    setGameState('RESOLVING');

    const transitionDelay = 2600;

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

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleAttempt(e.clientX, e.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.changedTouches.length > 0) {
      handleAttempt(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  };

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

  const handleOpeningComplete = useCallback(() => {
    setGameState('PLAYING');
  }, []);

  const handleEyesRevealed = useCallback(() => {
    setIsEyesRevealed(true);
  }, []);

  if (gameState === 'SUCCESS') {
    return (
      <Suspense fallback={null}>
        <Page2
          onComplete={() => setGameState('PAGE3')}
          onDeath={() => setGameState('FAILURE')}
        />
      </Suspense>
    );
  }

  if (gameState === 'PAGE3') {
    return (
      <Suspense fallback={null}>
        <Page3 />
      </Suspense>
    );
  }

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
      <div className="vignette-crimson" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <OpeningSequence onComplete={handleOpeningComplete} />

      <main className="relative z-20 flex items-center justify-center w-full h-full">
        <PantherEyes
          cursor={cursor}
          blinkState={blinkState}
          proximityState={proximityState}
          forceClosed={forceEyesClosed}
          onEyesRevealed={handleEyesRevealed}
        />
      </main>

      <div
        className={`resolution-fade-overlay ${isFadingOut ? 'active' : ''}`}
        aria-hidden="true"
      />

      <AccessibleTracker
        proximityState={proximityState}
        onAttemptAction={() => handleAttempt(cursor.x, cursor.y)}
        enabled={gameState === 'PLAYING'}
      />
    </div>
  );
};

export default App;
