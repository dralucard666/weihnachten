# Questions JSON Format Documentation

## Overview
This document describes the enhanced question format that supports video and image media at different stages of the question flow.

## Question Structure

### Basic Question Fields
- `id` (string, required): Unique identifier for the question
- `text` (string, required): The question text to display
- `type` (string, required): Question type - either "multiple-choice" or "custom-answers"

### Multiple Choice Questions
```json
{
  "id": "q1",
  "text": "What is the capital of France?",
  "type": "multiple-choice",
  "answers": [
    { "id": "a1", "text": "London" },
    { "id": "a2", "text": "Paris" },
    { "id": "a3", "text": "Berlin" }
  ],
  "correctAnswerId": "a2"
}
```

### Custom Answer Questions
```json
{
  "id": "q2",
  "text": "In what year did World War II end?",
  "type": "custom-answers",
  "correctAnswer": "1945",
  "correctAnswerId": "correct-q2"
}
```

## Media Configuration

### Media Stages
Questions can have media at two different stages:
1. **beforeQuestion**: Media shown before the question is displayed
2. **beforeAnswer**: Media shown before the correct answer is revealed

### Media Types

#### Video Media
```json
"media": {
  "beforeQuestion": {
    "type": "video",
    "sources": ["path/to/video.mp4"],
    "autoplay": true,
    "loop": false,
    "allowReplay": true,
    "allowMinimize": true,
    "allowMaximize": true
  }
}
```

**Video Options:**
- `type`: Must be "video"
- `sources`: Array of video file paths (relative to `src/assets/`)
- `autoplay` (optional, default: false): Whether to start playing automatically
- `loop` (optional, default: false): Whether to loop the video
- `allowReplay` (optional, default: false): Show replay button when video ends
- `allowMinimize` (optional, default: false): Allow minimizing to corner of screen
- `allowMaximize` (optional, default: false): Allow fullscreen mode

#### Image Media
```json
"media": {
  "beforeAnswer": {
    "type": "images",
    "sources": ["image1.jpg", "image2.jpg", "image3.jpg"],
    "autoplay": false,
    "slideshow": true,
    "slideshowInterval": 3000,
    "allowMinimize": true,
    "allowMaximize": true
  }
}
```

**Image Options:**
- `type`: Must be "images"
- `sources`: Array of image file paths (relative to `src/assets/`)
- `autoplay` (optional, default: false): Whether to start slideshow automatically
- `slideshow` (optional, default: false): Enable automatic slideshow mode
- `slideshowInterval` (optional, default: 3000): Milliseconds between slides
- `allowMinimize` (optional, default: false): Allow minimizing to corner of screen
- `allowMaximize` (optional, default: false): Allow fullscreen mode

## Complete Example

```json
{
  "id": "q1",
  "text": "What sport do the Cullens play in Twilight?",
  "type": "multiple-choice",
  "answers": [
    { "id": "a1", "text": "Soccer" },
    { "id": "a2", "text": "Baseball" },
    { "id": "a3", "text": "Basketball" }
  ],
  "correctAnswerId": "a2",
  "media": {
    "beforeQuestion": {
      "type": "video",
      "sources": ["twilight/intro-scene.mp4"],
      "autoplay": true,
      "loop": false,
      "allowReplay": true,
      "allowMinimize": true
    },
    "beforeAnswer": {
      "type": "video",
      "sources": ["twilight/baseball-scene.mp4"],
      "autoplay": true,
      "loop": false,
      "allowReplay": true,
      "allowMaximize": true
    }
  }
}
```

## Asset Organization

Place all media files in the `frontend/src/assets/` directory:

```
frontend/src/assets/
├── twilight/
│   ├── intro-scene.mp4
│   ├── baseball-scene.mp4
│   └── poster.jpg
├── planets/
│   ├── mars1.jpg
│   ├── mars2.jpg
│   └── mars3.jpg
└── history/
    └── titanic.mp4
```

## Media Loading Behavior

### Static Import (Current Implementation)
Media is referenced in the JSON and **dynamically imported** when needed:
- Files are bundled during build time
- Actual loading happens when the MediaDisplay component mounts
- Media only loads when that specific question is displayed

### Benefits
- **Lazy loading**: Media only loads when the question needs it
- **Code splitting**: Each media file can be in its own chunk
- **Optimal performance**: Users don't download media for questions they never see

### Usage in Components
The `MediaDisplay` component handles dynamic imports internally:
```typescript
import MediaDisplay from './components/MediaDisplay';

<MediaDisplay 
  media={question.media.beforeQuestion}
  onComplete={handleMediaComplete}
/>
```

## Implementation Notes

1. **File formats**: Support for common formats (mp4, webm for video; jpg, png, gif for images)
2. **Multiple videos**: Use `sources` array with single video path - multiple videos not supported per stage
3. **Multiple images**: Use `sources` array for image galleries/slideshows
4. **Controls**: Videos without autoplay show native browser controls
5. **Responsive**: Media displays scale appropriately on different screen sizes
