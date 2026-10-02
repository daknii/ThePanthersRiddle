import { useState, useEffect, useRef, useCallback } from 'react';
import type { ProximityState, BlinkState } from '../types/puzzle';

interface UseBlinkManagerProps {
  proximityState: ProximityState;
  distance?: number;
  forceClosed?: boolean;
  enabled?: boolean;
}

/**
 * Custom Hook: Blink State Management
 * Dynamically accelerates blinking frequency as the user approaches the hidden target:
 * - FAR: Infrequent, slow feline double-blinks (~3.5s - 5s).
 * - CLOSER: Blinking intervals progressively speed up (3s -> 1.8s -> 900ms -> 450ms).
 * - VERY CLOSE: Rapid alternating ping-pong flutter (~200ms - 300ms).
 * - INSIDE TARGET: Complete freeze! All blinking STOPS immediately, eyes lock wide open.
 */
export function useBlinkManager({
  proximityState,
  distance = Infinity,
  forceClosed = false,
  enabled = true,
}: UseBlinkManagerProps) {
  const [blinkState, setBlinkState] = useState<BlinkState>({
    leftEyeClosed: false,
    rightEyeClosed: false,
  });

  const activeTimersRef = useRef<number[]>([]);
  const nextEyeRef = useRef<'left' | 'right'>('left');
  const distanceRef = useRef(distance);
  const proximityRef = useRef(proximityState);
  const enabledRef = useRef(enabled);
  const forceClosedRef = useRef(forceClosed);

  // Keep refs synchronized
  useEffect(() => {
    distanceRef.current = distance;
    proximityRef.current = proximityState;
    enabledRef.current = enabled;
    forceClosedRef.current = forceClosed;
  }, [distance, proximityState, enabled, forceClosed]);

  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach((id) => clearTimeout(id));
    activeTimersRef.current = [];
  }, []);

  const blinkEye = useCallback((eye: 'left' | 'right' | 'both', durationMs = 240) => {
    if (proximityRef.current === 'INSIDE_TARGET' || forceClosedRef.current) return;

    setBlinkState((prev) => ({
      leftEyeClosed: eye === 'left' || eye === 'both' ? true : prev.leftEyeClosed,
      rightEyeClosed: eye === 'right' || eye === 'both' ? true : prev.rightEyeClosed,
    }));

    const timer = window.setTimeout(() => {
      setBlinkState((prev) => ({
        leftEyeClosed: eye === 'left' || eye === 'both' ? false : prev.leftEyeClosed,
        rightEyeClosed: eye === 'right' || eye === 'both' ? false : prev.rightEyeClosed,
      }));
    }, durationMs);

    activeTimersRef.current.push(timer);
  }, []);

  useEffect(() => {
    clearAllTimers();

    if (!enabled) {
      const resetTimer = window.setTimeout(() => {
        setBlinkState({ leftEyeClosed: false, rightEyeClosed: false });
      }, 0);
      activeTimersRef.current.push(resetTimer);
      return;
    }

    if (forceClosed) {
      const closeTimer = window.setTimeout(() => {
        setBlinkState({ leftEyeClosed: true, rightEyeClosed: true });
      }, 0);
      activeTimersRef.current.push(closeTimer);
      return;
    }

    // TARGET FOUND: STOP ALL BLINKING IMMEDIATELY!
    if (proximityState === 'INSIDE_TARGET') {
      const openTimer = window.setTimeout(() => {
        setBlinkState({ leftEyeClosed: false, rightEyeClosed: false });
      }, 0);
      activeTimersRef.current.push(openTimer);
      return;
    }

    // Dynamic Progressive Blinking Loop
    let isCancelled = false;

    const scheduleNextBlink = () => {
      if (isCancelled || !enabledRef.current || forceClosedRef.current) return;
      if (proximityRef.current === 'INSIDE_TARGET') {
        setBlinkState({ leftEyeClosed: false, rightEyeClosed: false });
        return;
      }

      const currentDist = distanceRef.current;
      const maxDistance = 500;
      const minDistance = 58; // Target hit radius
      const clampedDist = Math.max(minDistance, Math.min(maxDistance, currentDist));
      const factor = (clampedDist - minDistance) / (maxDistance - minDistance); // 0 (at edge) to 1 (far)

      // Frequency calculation:
      // factor = 1.0 (far): ~3600ms
      // factor = 0.5 (mid): ~1400ms
      // factor = 0.2 (close): ~550ms
      // factor = 0.05 (very close edge): ~220ms
      const delay = Math.round(180 + Math.pow(factor, 1.35) * 3400);

      // Blink closing duration:
      // When far: 240ms (slow, organic blink)
      // When near: 100ms (rapid, nervous twitch)
      const duration = Math.round(95 + Math.pow(factor, 1.2) * 145);

      // Eye mode selection:
      let eyeToBlink: 'left' | 'right' | 'both';
      if (factor > 0.65) {
        // Far away: predominantly slow double blinks
        eyeToBlink = Math.random() < 0.75 ? 'both' : (Math.random() < 0.5 ? 'left' : 'right');
      } else if (factor > 0.25) {
        // Getting closer: asynchronous alternating wink
        eyeToBlink = nextEyeRef.current;
        nextEyeRef.current = nextEyeRef.current === 'left' ? 'right' : 'left';
      } else {
        // Very close: rapid alternating ping-pong flutter
        eyeToBlink = nextEyeRef.current;
        nextEyeRef.current = nextEyeRef.current === 'left' ? 'right' : 'left';
      }

      const timerId = window.setTimeout(() => {
        if (isCancelled || proximityRef.current === 'INSIDE_TARGET') return;
        blinkEye(eyeToBlink, duration);
        scheduleNextBlink();
      }, delay);

      activeTimersRef.current.push(timerId);
    };

    // Initial kick-off with a responsive short delay
    const initialDelay = proximityState === 'VERY_CLOSE' ? 120 : proximityState === 'CLOSER' ? 300 : 800;
    const startTimer = window.setTimeout(() => {
      scheduleNextBlink();
    }, initialDelay);
    activeTimersRef.current.push(startTimer);

    return () => {
      isCancelled = true;
      clearAllTimers();
    };
  }, [proximityState, distance, forceClosed, enabled, blinkEye, clearAllTimers]);

  return {
    blinkState: forceClosed ? { leftEyeClosed: true, rightEyeClosed: true } : blinkState,
  };
}
