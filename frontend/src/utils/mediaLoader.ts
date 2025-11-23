/**
 * Media Loader Utility
 * 
 * This provides a type-safe way to load media files from the assets folder.
 * Uses Vite's glob import for static analysis and optimal bundling.
 * 
 * Alternative approach: If you prefer explicit imports, you can import files directly:
 * 
 * import video from '../assets/twilight/twilight.mp4'
 * 
 * Then reference them in your questions JSON by their path, and create a mapping:
 * 
 * const mediaMap = {
 *   'twilight/twilight.mp4': video,
 *   'planets/mars.jpg': mars,
 *   // ... etc
 * }
 */

// Get all media files from assets folder
import.meta.glob<{ default: string }>('../assets/**/*.{mp4,webm,mp3,jpg,jpeg,png,gif,svg}', { 
  eager: false 
});

/**
 * Load a media file from the backend server
 * @param path - Path relative to media folder (e.g., 'twilight/twilight.mp4')
 * @returns The media URL
 */
export function loadMedia(path: string): string {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://192.168.178.22:3001';
  return `${backendUrl}/media/${path}`;
}

/**
 * Load multiple media files
 * @param paths - Array of paths relative to media folder
 * @returns Array of media URLs
 */
export function loadMediaBatch(paths: string[]): string[] {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://192.168.178.22:3001';
  return paths.map(path => `${backendUrl}/media/${path}`);
}

/**
 * Check if a media file exists (now always returns true as validation happens on backend)
 * @param path - Path relative to media folder
 * @returns Boolean indicating if the file exists
 */
export function mediaExists(): boolean {
  // Media validation now happens on the backend
  return true;
}

/**
 * Get all available media file paths (no longer available with backend approach)
 * @returns Empty array
 */
export function getAvailableMedia(): string[] {
  // This function is no longer applicable with backend media serving
  return [];
}
