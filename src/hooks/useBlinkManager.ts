import { useState, useEffect, useRef, useCallback } from 'react';
import type { ProximityState, BlinkState } from '../types/puzzle';

interface UseBlinkManagerProps {
  proximityState: ProximityState;
  distance?: number;
  forceClosed?: boolean;
  enabled?: boolean;
}

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

    if (proximityState === 'INSIDE_TARGET') {
      const openTimer = window.setTimeout(() => {
        setBlinkState({ leftEyeClosed: false, rightEyeClosed: false });
      }, 0);
      activeTimersRef.current.push(openTimer);
      return;
    }

    let isCancelled = false;

    const scheduleNextBlink = () => {
      if (isCancelled || !enabledRef.current || forceClosedRef.current) return;
      if (proximityRef.current === 'INSIDE_TARGET') {
        setBlinkState({ leftEyeClosed: false, rightEyeClosed: false });
        return;
      }

      const currentDist = distanceRef.current;
      const maxDistance = 500;
      const minDistance = 58;
      const clampedDist = Math.max(minDistance, Math.min(maxDistance, currentDist));
      const factor = (clampedDist - minDistance) / (maxDistance - minDistance);

      const delay = Math.round(180 + Math.pow(factor, 1.35) * 3400);
      const duration = Math.round(95 + Math.pow(factor, 1.2) * 145);

      let eyeToBlink: 'left' | 'right' | 'both';
      if (factor > 0.65) {
        eyeToBlink = Math.random() < 0.75 ? 'both' : (Math.random() < 0.5 ? 'left' : 'right');
      } else if (factor > 0.25) {
        eyeToBlink = nextEyeRef.current;
        nextEyeRef.current = nextEyeRef.current === 'left' ? 'right' : 'left';
      } else {
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

    const kickOffDelay = proximityState === 'FAR' ? 1400 : 350;
    const kickOffTimer = window.setTimeout(() => {
      scheduleNextBlink();
    }, kickOffDelay);

    activeTimersRef.current.push(kickOffTimer);

    return () => {
      isCancelled = true;
      clearAllTimers();
    };
  }, [proximityState, enabled, forceClosed, clearAllTimers, blinkEye]);

  return { blinkState };
}
