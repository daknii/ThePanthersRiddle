import { useMemo, useState, useEffect } from 'react';
import type { ProximityState, CursorPosition, TargetConfig } from '../types/puzzle';
import { PUZZLE_CONFIG, getTargetPixelCoordinates } from '../config/puzzleConfig';

interface UseProximityProps {
  cursor: CursorPosition;
  config?: TargetConfig;
}

export function useProximityCalculation({ cursor, config = PUZZLE_CONFIG }: UseProximityProps) {
  const [targetCoords, setTargetCoords] = useState(() => getTargetPixelCoordinates(config));

  // Keep target pixel coordinates updated on window resize
  useEffect(() => {
    const handleResize = () => {
      setTargetCoords(getTargetPixelCoordinates(config));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config]);

  const { distance, proximityState, isInsideTarget } = useMemo(() => {
    if (!cursor.isEngaged) {
      return {
        distance: Infinity,
        proximityState: 'FAR' as ProximityState,
        isInsideTarget: false,
      };
    }

    const dx = cursor.x - targetCoords.x;
    const dy = cursor.y - targetCoords.y;
    const dist = Math.hypot(dx, dy);

    let state: ProximityState = 'FAR';

    if (dist <= config.hitRadiusPx) {
      state = 'INSIDE_TARGET';
    } else if (dist <= config.thresholds.veryClosePx) {
      state = 'VERY_CLOSE';
    } else if (dist <= config.thresholds.closerPx) {
      state = 'CLOSER';
    } else if (dist <= config.thresholds.gettingCloserPx) {
      state = 'GETTING_CLOSER';
    } else {
      state = 'FAR';
    }

    return {
      distance: dist,
      proximityState: state,
      isInsideTarget: dist <= config.hitRadiusPx,
    };
  }, [cursor, targetCoords, config]);

  return {
    distance,
    proximityState,
    isInsideTarget,
    targetCoords,
  };
}
