# i18n Implementation Summary

## Overview
Successfully added internationalization (i18n) support to the quiz app with German and English translations.

## What Was Added

### 1. Translation Files
- **`/frontend/src/i18n/translations.ts`** - Contains all text translations for English and German
  - Organized into logical sections (startPage, lobby, playerJoin, game, etc.)
  - Supports switching between `en` and `de` languages

### 2. i18n Context Provider
- **`/frontend/src/i18n/i18nContext.tsx`** - React context for managing language state
  - `useI18n()` hook to access translations in any component
  - Automatically saves language preference to localStorage
  - Provides `t` object for translations and `setLanguage` function

### 3. Language Switcher Component
- **`/frontend/src/components/LanguageSwitcher.tsx`** - Reusable language toggle button
  - Can be positioned fixed or static
  - Shows current language and toggles between DE/EN

## Updated Components

All major UI components now use translations:

### Pages
- StartPage
- GameMasterPage
- PlayerPage

### Game Components
- GameLobbyView
- GamePlayingView (Host)
- GameFinishedView (Host & Player)

### Player Components
- PlayerJoinView
- PlayerLobbyView
- PlayerGameView and all sub-components:
  - CustomAnswerInput
  - VotingView
  - MultipleChoiceView
  - TextInputView
  - WaitingView
  - PlayerHeader
  - SubmissionConfirmation

### Modals
- ReconnectModal
- ReconnectMasterModal

### Host Components
- HostControlButtons (includes language switcher in bottom-right)

## How to Use

### In Components
```typescript
import { useI18n } from '../i18n/i18nContext';

function MyComponent() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t.startPage.title}</h1>
      <button onClick={() => setLanguage('de')}>Deutsch</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

### Language Switching
The `setLanguage` function from `useI18n()` is already connected to:
- GameMasterPage (via the `language` and `setLanguage` props passed from context)
- HostControlButtons (language switcher button in bottom-right corner)
- LanguageSwitcher component (available on StartPage)

### Adding New Translations
1. Open `/frontend/src/i18n/translations.ts`
2. Add new keys to both `en` and `de` objects
3. Use the new keys with `t.section.key` in your components

## Features
- ✅ Automatic language persistence (localStorage)
- ✅ Default language: German (`de`)
- ✅ All UI text translated
- ✅ Type-safe translation keys
- ✅ Language switcher in host game controls
- ✅ Language switcher on start page
- ✅ Question language changes based on selected UI language

## Integration with Existing Features
- The GameMasterPage already uses the `setLanguage` function you specified
- Questions are loaded once from a merged `questions.json` file containing both languages
- Language switching happens instantly without re-fetching data from the server
- All player-facing text respects the language selection

## Questions Data Structure
Questions are now stored in a single merged file (`questions.json`) with bilingual content:
```json
[
  {
    "type": "multiple-choice",
    "text": {
      "de": "German question text",
      "en": "English question text"
    },
    "answers": [
      {
        "id": "a1",
        "text": {
          "de": "German answer",
          "en": "English answer"
        }
      }
    ],
    "correctAnswerId": "a1"
  }
]
```

This structure:
- Eliminates the need to re-fetch questions when language changes
- Prevents page re-renders during language switching
- Keeps questions synchronized across languages
- Simplifies question management (only one file to edit)
