import { useEffect, useRef, useState } from "react";
import type { MediaConfig } from "../../../../shared/types";
import { loadMediaBatch } from "../../utils/mediaLoader";
import { useI18n } from "../../i18n/useI18n";

interface MediaDisplayProps {
  media: MediaConfig;
  onComplete?: () => void; // Called when video ends or slideshow completes
  className?: string;
}

export default function MediaDisplay({
  media,
  onComplete,
  className = "",
}: MediaDisplayProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(media.autoplay ?? false);
  const [mediaSources, setMediaSources] = useState<string[]>([]);

  useEffect(() => {
    // Load media URLs from backend
    const loadedSources = loadMediaBatch(media.sources);
    setMediaSources(loadedSources);
  }, [media.sources]);

  // Handle Escape key to continue/dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onComplete) {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  // Handle video playback
  useEffect(() => {
    if (media.type === "video" && videoRef.current && mediaSources.length > 0) {
      if (media.autoplay) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [mediaSources, media.type, media.autoplay]);

  // Handle image slideshow
  useEffect(() => {
    if (
      media.type === "images" &&
      media.slideshow &&
      isPlaying &&
      mediaSources.length > 1
    ) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const nextIndex = (prev + 1) % mediaSources.length;
          // Call onComplete when slideshow finishes one cycle
          if (nextIndex === 0 && onComplete) {
            onComplete();
          }
          return nextIndex;
        });
      }, media.slideshowInterval || 3000);

      return () => clearInterval(interval);
    }
  }, [
    media.type,
    media.slideshow,
    media.slideshowInterval,
    mediaSources.length,
    isPlaying,
    onComplete,
  ]);

  const handleVideoEnd = () => {
    setIsPlaying(false);
    // Only call onComplete if allowReplay is false (auto-dismiss)
    // If allowReplay is true, user must manually dismiss or replay
    if (onComplete && !media.allowReplay) {
      onComplete();
    }
  };

  const handleReplay = () => {
    if (media.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    } else if (media.type === "images") {
      setCurrentImageIndex(0);
      setIsPlaying(true);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMaximized) setIsMaximized(false);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (isMinimized) setIsMinimized(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mediaSources.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + mediaSources.length) % mediaSources.length
    );
  };

  if (mediaSources.length === 0) {
    return null;
  }

  const containerClass = `
    ${className}
    ${isMinimized ? "fixed bottom-6 right-6 w-64 h-48" : ""}
    ${
      isMaximized
        ? "fixed inset-0 z-50 bg-black"
        : isMinimized
          ? ""
          : "max-w-4xl max-h-[70vh] mx-auto"
    }
    bg-black rounded-xl shadow-2xl border-2 border-yellow-400 overflow-hidden flex items-center justify-center
  `;

  return (
    <div className={containerClass}>
      <div className="relative max-w-full max-h-full flex items-center justify-center">
        {/* Media Content */}
        {media.type === "video" ? (
          <video
            ref={videoRef}
            src={mediaSources[0]}
            className="max-w-full max-h-[70vh] object-contain"
            onEnded={handleVideoEnd}
            playsInline
            controls
            loop={media.loop}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={mediaSources[currentImageIndex]}
              alt={`Media ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            {mediaSources.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {mediaSources.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Control Buttons Overlay */}
        <div className="absolute top-2 right-2 flex gap-2">
          {media.allowReplay && !isPlaying && (
            <button
              onClick={handleReplay}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/20"
              title={t.media.replay}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
          {media.allowReplay && onComplete && (
            <button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/20 font-semibold flex items-center gap-1"
              title={t.media.continue}
            >
              <span>{t.media.continue}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          {media.allowMinimize && !isMinimized && (
            <button
              onClick={toggleMinimize}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/20"
              title={t.media.minimize}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
          {media.allowMinimize && isMinimized && (
            <button
              onClick={toggleMinimize}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/20"
              title={t.media.restore}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          )}
          {media.allowMaximize && (
            <button
              onClick={toggleMaximize}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-all duration-200 border border-white/20"
              title={isMaximized ? t.media.exitFullscreen : t.media.fullscreen}
            >
              {isMaximized ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
