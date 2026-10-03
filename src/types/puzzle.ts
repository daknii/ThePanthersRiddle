export type ProximityState =
  | 'FAR'
  | 'GETTING_CLOSER'
  | 'CLOSER'
  | 'VERY_CLOSE'
  | 'INSIDE_TARGET';

export type GameState =
  | 'OPENING'
  | 'PLAYING'
  | 'RESOLVING'
  | 'SUCCESS'
  | 'FAILURE'
  | 'PAGE3';

export interface TargetConfig {
  xPercent: number;
  yPercent: number;
  hitRadiusPx: number;
  thresholds: {
    gettingCloserPx: number;
    closerPx: number;
    veryClosePx: number;
  };
  debugMode?: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
  isEngaged: boolean;
}

export interface BlinkState {
  leftEyeClosed: boolean;
  rightEyeClosed: boolean;
}
