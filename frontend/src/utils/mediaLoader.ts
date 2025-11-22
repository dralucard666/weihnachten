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
const mediaModules = import.meta.glob<{ default: string }>('../assets/**/*.{mp4,webm,mp3,jpg,jpeg,png,gif,svg}', { 
  eager: false 
});

/**
 * Load a media file from the assets folder
 * @param path - Path relative to assets folder (e.g., 'twilight/twilight.mp4')
 * @returns Promise that resolves to the media URL
 */
export async function loadMedia(path: string): Promise<string> {
  const fullPath = `../assets/${path}`;
  const loader = mediaModules[fullPath];
  
  if (!loader) {
    throw new Error(`Media file not found: ${path}. Available files: ${Object.keys(mediaModules).join(', ')}`);
  }
  
  const module = await loader();
  return module.default;
}

/**
 * Load multiple media files
 * @param paths - Array of paths relative to assets folder
 * @returns Promise that resolves to array of media URLs
 */
export async function loadMediaBatch(paths: string[]): Promise<string[]> {
  return Promise.all(paths.map(loadMedia));
}

/**
 * Check if a media file exists
 * @param path - Path relative to assets folder
 * @returns Boolean indicating if the file exists
 */
export function mediaExists(path: string): boolean {
  const fullPath = `../assets/${path}`;
  return fullPath in mediaModules;
}

/**
 * Get all available media file paths
 * @returns Array of all media file paths
 */
export function getAvailableMedia(): string[] {
  return Object.keys(mediaModules).map(path => path.replace('../assets/', ''));
}
