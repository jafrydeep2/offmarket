import { createContext, useContext, useState, useEffect } from 'react';
import frTranslations from '@/i18n/fr.json';
import enTranslations from '@/i18n/en.json';

type Language = 'fr' | 'en';
type Translations = typeof frTranslations;

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const TranslationContext = createContext<TranslationContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key: string) => key,
});

const translations = {
  fr: frTranslations,
  en: enTranslations,
} as const;

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const getNestedTranslation = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

export const createTranslationFunction = (language: Language) => {
  return (key: string): string => {
    return getNestedTranslation(translations[language], key);
  };
};