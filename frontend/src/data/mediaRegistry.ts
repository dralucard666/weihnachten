/**
 * Media Registry - Explicit Import Approach
 * 
 * Use this if the dynamic import approach in mediaLoader.ts has issues.
 * This provides explicit control over all media files used in questions.
 * 
 * To use:
 * 1. Import your media files here
 * 2. Add them to the registry with their JSON path as the key
 * 3. Update MediaDisplay.tsx to use this registry instead of dynamic imports
 */

// Import all your media files here
// Example:
// import twilightVideo from '../assets/twilight/twilight.mp4';
// import baseballScene from '../assets/twilight/baseball-scene.mp4';
// import mars1 from '../assets/planets/mars1.jpg';

// Export a registry mapping JSON paths to imported URLs
export const mediaRegistry: Record<string, string> = {
  // Add your media mappings here:
  // 'twilight/twilight.mp4': twilightVideo,
  // 'twilight/baseball-scene.mp4': baseballScene,
  // 'planets/mars1.jpg': mars1,
};

/**
 * Get a media URL from the registry
 * @param path - Path as referenced in questions.json
 * @returns The media URL or undefined if not found
 */
export function getMediaUrl(path: string): string | undefined {
  return mediaRegistry[path];
}

/**
 * Get multiple media URLs from the registry
 * @param paths - Array of paths as referenced in questions.json
 * @returns Array of media URLs (undefined entries for not found)
 */
export function getMediaUrls(paths: string[]): (string | undefined)[] {
  return paths.map(getMediaUrl);
}

/**
 * Check if a media path exists in the registry
 * @param path - Path to check
 * @returns Boolean indicating if the path exists
 */
export function hasMedia(path: string): boolean {
  return path in mediaRegistry;
}
