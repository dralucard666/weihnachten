import { createContext } from 'react';
import type { I18nContextType } from './i18nContext';

export const I18nContext = createContext<I18nContextType | undefined>(undefined);
