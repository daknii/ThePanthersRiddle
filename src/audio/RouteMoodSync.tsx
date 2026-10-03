import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { audioEngine, moodForPath } from './audioEngine';

/** Sets the music mood for pages opened directly by URL (e.g. /klvnz). */
export function RouteMoodSync(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    const mood = moodForPath(pathname);
    if (mood) audioEngine.setMood(mood);
  }, [pathname]);

  return null;
}
