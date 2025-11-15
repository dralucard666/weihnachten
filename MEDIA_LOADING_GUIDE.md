# Media Loading - Implementation Guide

## ✅ What I've Implemented

I've removed the explicit twilight video import from `GamePlayingView.tsx` and created a flexible media loading system.

## 🎯 How Media Loading Works Now

### The Answer to Your Question:
**Media files are loaded ONLY when the question that uses them is displayed.**

- ✅ Files are discovered at **build time** (Vite processes them)
- ✅ Actual download happens at **runtime** when `MediaDisplay` component mounts
- ✅ Perfect for lazy loading - users don't download videos they never see

## 📦 Two Approaches Available

### Approach 1: Dynamic Loading (What I Built)

**Files:**
- `MediaDisplay.tsx` - Component that handles all media display
- `mediaLoader.ts` - Utility for dynamic imports
- `questions.json` - JSON with media configuration

**Usage:**
```tsx
import MediaDisplay from './components/MediaDisplay';

<MediaDisplay 
  media={currentQuestion.media?.beforeAnswer}
  onComplete={() => console.log('Media finished')}
/>
```

**Pros:**
- Just reference media paths in JSON
- Automatic lazy loading
- No manual imports needed

**Cons:**
- Requires all media to be in assets folder with proper extensions
- Vite needs to statically analyze the glob pattern

### Approach 2: Explicit Imports (Simpler, More Reliable)

If dynamic loading has issues, use explicit imports:

**Step 1:** Create a media registry
```typescript
// src/data/mediaRegistry.ts
import twilightVideo from '../assets/twilight/twilight.mp4';
import baseballScene from '../assets/twilight/baseball-scene.mp4';
import mars1 from '../assets/planets/mars1.jpg';

export const mediaRegistry: Record<string, string> = {
  'twilight/twilight.mp4': twilightVideo,
  'twilight/baseball-scene.mp4': baseballScene,
  'planets/mars1.jpg': mars1,
  // Add all your media files here
};
```

**Step 2:** Update MediaDisplay to use registry
```typescript
// In MediaDisplay.tsx
import { mediaRegistry } from '../data/mediaRegistry';

useEffect(() => {
  const loadedSources = media.sources.map(source => {
    const url = mediaRegistry[source];
    if (!url) {
      console.error(`Media not found in registry: ${source}`);
      return '';
    }
    return url;
  }).filter(Boolean);
  
  setMediaSources(loadedSources);
}, [media.sources]);
```

**Pros:**
- More reliable, explicit control
- TypeScript autocomplete for paths
- Clear what's bundled

**Cons:**
- Must manually import each media file
- Update registry when adding new media

## 🚀 Recommended Next Steps

1. **Test the dynamic approach first** - it should work with Vite
2. **If you get import errors**, switch to the explicit registry approach
3. **Integrate MediaDisplay** into your question flow:

```tsx
// Show media before question
{currentQuestion.media?.beforeQuestion && (
  <MediaDisplay 
    media={currentQuestion.media.beforeQuestion}
    onComplete={() => setShowQuestion(true)}
  />
)}

// Show media before answer
{showCorrectAnswer && currentQuestion.media?.beforeAnswer && (
  <MediaDisplay 
    media={currentQuestion.media.beforeAnswer}
    onComplete={() => console.log('Answer revealed!')}
  />
)}
```

## 📝 JSON Format Example

```json
{
  "id": "q1",
  "text": "What sport do the Cullens play?",
  "type": "multiple-choice",
  "answers": [...],
  "correctAnswerId": "a2",
  "media": {
    "beforeQuestion": {
      "type": "video",
      "sources": ["twilight/twilight.mp4"],
      "autoplay": true,
      "allowReplay": true,
      "allowMinimize": true
    },
    "beforeAnswer": {
      "type": "video",
      "sources": ["twilight/baseball-scene.mp4"],
      "autoplay": true,
      "allowMaximize": true
    }
  }
}
```

## 🔍 Debugging

If media doesn't load:

1. Check browser console for errors
2. Verify files exist in `src/assets/` with correct paths
3. Check file extensions match the glob pattern in `mediaLoader.ts`
4. Try the explicit registry approach instead

Would you like me to help integrate the MediaDisplay component into your GamePlayingView?
