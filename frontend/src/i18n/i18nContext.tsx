import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { translations, type Language, type TranslationKeys } from './translations';
import { I18nContext } from './context';

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get saved language from localStorage
    const saved = localStorage.getItem('quiz-language');
    return (saved === 'en' || saved === 'de') ? saved : 'de';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('quiz-language', lang);
  }, []);

  const value: I18nContextType = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language],
  }), [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
