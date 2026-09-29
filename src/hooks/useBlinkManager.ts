import { useState, useEffect, useRef, useCallback } from 'react';
import type { ProximityState, BlinkState } from '../types/puzzle';

interface UseBlinkManagerProps {
  proximityState: ProximityState;
  forceClosed?: boolean;
  enabled?: boolean;
}

/**
 * Custom Hook: Blink State Management
 * Controls the realistic, smooth blinking patterns of the red panther eyes based on proximity:
 * - FAR: Barely reacts (infrequent, slow natural blinks)
 * - GETTING_CLOSER: One eye starts blinking periodically
 * - CLOSER: Both eyes blink asynchronously
 * - VERY_CLOSE: Eyes blink alternately (ping-pong cadence)
 * - INSIDE_TARGET: Final proximity state (predatory lock, wide open, hyper-focused)
 */
export function useBlinkManager({
  proximityState,
  forceClosed = false,
  enabled = true,
}: UseBlinkManagerProps) {
  const [blinkState, setBlinkState] = useState<BlinkState>({
    leftEyeClosed: false,
    rightEyeClosed: false,
  });

  const activeTimersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach((id) => clearTimeout(id));
    activeTimersRef.current = [];
  }, []);

  const blinkEye = useCallback((eye: 'left' | 'right' | 'both', durationMs = 280) => {
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
      setBlinkState({ leftEyeClosed: false, rightEyeClosed: false });
      return;
    }

    if (forceClosed) {
      setBlinkState({ leftEyeClosed: true, rightEyeClosed: true });
      return;
    }

    switch (proximityState) {
      case 'FAR': {
        // Natural, slow feline blink every 6 to 10 seconds
        const scheduleFarBlink = () => {
          const delay = 6000 + Math.random() * 4500;
          const timer = window.setTimeout(() => {
            blinkEye('both', 300);
            scheduleFarBlink();
          }, delay);
          activeTimersRef.current.push(timer);
        };
        scheduleFarBlink();
        break;
      }

      case 'GETTING_CLOSER': {
        // One eye (left eye) starts blinking periodically with smooth pacing
        const scheduleOneEyeBlink = () => {
          const delay = 2400 + Math.random() * 1200;
          const timer = window.setTimeout(() => {
            blinkEye('left', 260);
            scheduleOneEyeBlink();
          }, delay);
          activeTimersRef.current.push(timer);
        };
        scheduleOneEyeBlink();
        break;
      }

      case 'CLOSER': {
        // Both eyes blink asynchronously at independent smooth intervals
        const scheduleLeftAsync = () => {
          const delay = 1800 + Math.random() * 900;
          const timer = window.setTimeout(() => {
            blinkEye('left', 260);
            scheduleLeftAsync();
          }, delay);
          activeTimersRef.current.push(timer);
        };

        const scheduleRightAsync = () => {
          const delay = 2500 + Math.random() * 1100;
          const timer = window.setTimeout(() => {
            blinkEye('right', 260);
            scheduleRightAsync();
          }, delay);
          activeTimersRef.current.push(timer);
        };

        scheduleLeftAsync();
        scheduleRightAsync();
        break;
      }

      case 'VERY_CLOSE': {
        // Eyes blink alternately in a smooth ping-pong rhythm (left then right)
        let isLeftTurn = true;
        const scheduleAlternateBlink = () => {
          const delay = 720;
          const timer = window.setTimeout(() => {
            blinkEye(isLeftTurn ? 'left' : 'right', 250);
            isLeftTurn = !isLeftTurn;
            scheduleAlternateBlink();
          }, delay);
          activeTimersRef.current.push(timer);
        };
        scheduleAlternateBlink();
        break;
      }

      case 'INSIDE_TARGET': {
        // Final Proximity State: Hyper-focused predatory lock
        // Eyes stay wide open, zero spontaneous blinking
        setBlinkState({ leftEyeClosed: false, rightEyeClosed: false });
        break;
      }
    }

    return () => clearAllTimers();
  }, [proximityState, forceClosed, enabled, blinkEye, clearAllTimers]);

  return {
    blinkState: forceClosed ? { leftEyeClosed: true, rightEyeClosed: true } : blinkState,
  };
}
