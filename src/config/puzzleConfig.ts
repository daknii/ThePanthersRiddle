import type { TargetConfig } from '../types/puzzle';

export const PUZZLE_CONFIG: TargetConfig = {
  xPercent: 74,
  yPercent: 28,
  hitRadiusPx: 58,
  thresholds: {
    gettingCloserPx: 480,
    closerPx: 280,
    veryClosePx: 140,
  },
  debugMode: false,
};

export function getTargetPixelCoordinates(config: TargetConfig = PUZZLE_CONFIG): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  return {
    x: (window.innerWidth * config.xPercent) / 100,
    y: (window.innerHeight * config.yPercent) / 100,
  };
}
