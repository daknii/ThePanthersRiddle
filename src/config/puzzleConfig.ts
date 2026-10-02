import type { TargetConfig } from '../types/puzzle';

/**
 * Dedicated Puzzle Configuration for Page 1
 * Holds the invisible target's viewport coordinates, hit radius,
 * and the distance thresholds determining the red panther eyes' blinking behavior.
 */
export const PUZZLE_CONFIG: TargetConfig = {
  // Invisible target location in percentage of the viewport
  // (e.g., x: 74% from left, y: 28% from top)
  xPercent: 74,
  yPercent: 28,

  // Hit radius: inside this radius, the click is registered as SUCCESS
  // Slightly expanded for fairer, more intuitive discovery
  hitRadiusPx: 58,

  // Distance thresholds from cursor to target center (in pixels)
  thresholds: {
    gettingCloserPx: 480, // Start initial blinking response
    closerPx: 280,        // Noticeably faster blinking
    veryClosePx: 140,     // Very rapid alternating ping-pong flutter
    // <= hitRadiusPx (58px) = INSIDE_TARGET (stop blinking + red signal)
  },

  // STRICT DESIGN RULE: No debug indicators in production UI
  debugMode: false,
};

/**
 * Helper to compute the absolute target coordinates in pixels
 * for the current window size.
 */
export function getTargetPixelCoordinates(config: TargetConfig = PUZZLE_CONFIG): { x: number; y: number } {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  return {
    x: (window.innerWidth * config.xPercent) / 100,
    y: (window.innerHeight * config.yPercent) / 100,
  };
}
