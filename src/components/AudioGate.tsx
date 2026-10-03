import React, { useCallback, useEffect, useRef, useState } from 'react';
import { audioEngine } from '../audio/audioEngine';

const EXIT_MS = 1200;

/**
 * Minimal entry screen shown before the riddle. The click on "entrar" is the
 * user gesture browsers require before audio can play.
 */
export const AudioGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<'idle' | 'leaving' | 'entered'>('idle');
  const enteredRef = useRef(false);

  const enter = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    audioEngine.start();
    setPhase('leaving');
    window.setTimeout(() => setPhase('entered'), EXIT_MS);
  }, []);

  useEffect(() => {
    if (phase !== 'idle') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, enter]);

  if (phase === 'entered') return <>{children}</>;

  return (
    <div
      className={`audio-gate ${phase === 'leaving' ? 'is-leaving' : ''}`}
      onClick={enter}
      role="button"
      tabIndex={0}
      aria-label="Clique para entrar no Enigma da Pantera"
    >
      <h1 className="sr-only">Enigma da Pantera</h1>
      <button
        id="audio-gate-enter"
        type="button"
        className="audio-gate__button"
        onClick={(e) => {
          e.stopPropagation();
          enter();
        }}
        autoFocus
      >
        entrar
      </button>
      <p className="audio-gate__hint">use fones de ouvido</p>
    </div>
  );
};
