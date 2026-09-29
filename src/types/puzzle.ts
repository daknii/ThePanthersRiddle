/**
 * Type definitions for Enigma Antirian Puzzle (Page 1)
 */

export type ProximityState =
  | 'FAR'            // Far away: Eyes barely react
  | 'GETTING_CLOSER' // Getting closer: One eye starts blinking
  | 'CLOSER'         // Closer: Both eyes blink asynchronously
  | 'VERY_CLOSE'     // Very close: Eyes blink alternately
  | 'INSIDE_TARGET'; // Inside target: Final proximity state (predatory dilation / hyper-focus)

export type GameState =
  | 'OPENING'   // Initial black screen -> text fade-in -> eye awakening
  | 'PLAYING'   // Interactive puzzle mode (cursor tracking + blink proximity)
  | 'RESOLVING' // Click triggered, eyes slowly closing before transition
  | 'SUCCESS'   // Correct click inside target -> Page 2
  | 'FAILURE'   // Click anywhere else -> "FALSO" screen and puzzle lock
  | 'PAGE3';    // Completed 7 consecutive clicks on Page 2 -> Placeholder Page 3

export interface TargetConfig {
  /** Target center position X as percentage of viewport (0 to 100) */
  xPercent: number;
  /** Target center position Y as percentage of viewport (0 to 100) */
  yPercent: number;
  /** Radius of the invisible target hit area in pixels */
  hitRadiusPx: number;
  /** Distance thresholds in pixels relative to viewport scaling */
  thresholds: {
    gettingCloserPx: number; // e.g., 380px
    closerPx: number;        // e.g., 220px
    veryClosePx: number;     // e.g., 90px
  };
  /** Debug flag (must be false in production) */
  debugMode?: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  normalizedX: number; // -1 (left) to 1 (right)
  normalizedY: number; // -1 (top) to 1 (bottom)
  isEngaged: boolean;
}

export interface BlinkState {
  leftEyeClosed: boolean;
  rightEyeClosed: boolean;
}
