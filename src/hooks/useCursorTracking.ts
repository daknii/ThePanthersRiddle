import { useState, useEffect, useCallback, useRef } from 'react';
import type { CursorPosition } from '../types/puzzle';

interface UseCursorTrackingOptions {
  enabled: boolean;
}

/**
 * Custom Hook: Cursor Tracking
 * Tracks mouse and touch coordinates, provides normalized values for pupil shift,
 * and includes keyboard navigation (Arrow keys) as an accessible alternative.
 */
export function useCursorTracking({ enabled }: UseCursorTrackingOptions) {
  const [cursor, setCursor] = useState<CursorPosition>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    normalizedX: 0,
    normalizedY: 0,
    isEngaged: false,
  });

  const cursorRef = useRef(cursor);
  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;

    // Normalized from -1 (left/top) to +1 (right/bottom)
    const normX = Math.max(-1, Math.min(1, ((clientX - width / 2) / (width / 2))));
    const normY = Math.max(-1, Math.min(1, ((clientY - height / 2) / (height / 2))));

    setCursor({
      x: clientX,
      y: clientY,
      normalizedX: normX,
      normalizedY: normY,
      isEngaged: true,
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // Accessible Alternative: Keyboard Navigation with Arrow Keys
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 40 : 15;
      let newX = cursorRef.current.x;
      let newY = cursorRef.current.y;
      let moved = false;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX = Math.max(0, newX - step);
          moved = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX = Math.min(window.innerWidth, newX + step);
          moved = true;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY = Math.max(0, newY - step);
          moved = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY = Math.min(window.innerHeight, newY + step);
          moved = true;
          break;
      }

      if (moved) {
        e.preventDefault();
        updatePosition(newX, newY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, updatePosition]);

  return cursor;
}
