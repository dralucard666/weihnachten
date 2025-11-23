import { useRef, useCallback, useEffect } from 'react';
import { loadMediaBatch } from '../utils/mediaLoader';

/**
 * Hook to play sound on hover
 * @param soundPaths - Array of sound file paths relative to assets folder
 * @returns Object with onMouseEnter handler and preload function
 */
export function useHoverSound(soundPaths?: string[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedUrlsRef = useRef<string[]>([]);

  // Preload audio files
  useEffect(() => {
    if (!soundPaths || soundPaths.length === 0) return;

    const urls = loadMediaBatch(soundPaths);
    loadedUrlsRef.current = urls;
    // Create audio element for the first sound
    if (urls.length > 0) {
      audioRef.current = new Audio(urls[0]);
      audioRef.current.preload = 'auto';
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundPaths?.join(',')]);

  const playSound = useCallback(() => {
    if (!audioRef.current || loadedUrlsRef.current.length === 0) return;

    // Reset and play the audio
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.error('Failed to play sound:', err);
    });
  }, []);

  const stopSound = useCallback(() => {
    if (!audioRef.current) return;

    // Pause and reset the audio
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  return {
    onMouseEnter: playSound,
    onMouseLeave: stopSound,
  };
}
