import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '../utils/translations';

// Define the structure of a translation dictionary
interface TranslationDictionary {
  [key: string]: string;
}

// Define the structure of all translations
interface Translations {
  [language: string]: TranslationDictionary;
}

// Type assertion for translations
const typedTranslations = translations as Translations;

interface TranslationContextType {
  language: string;
  t: (key: string, params?: Record<string, string>) => string;
  changeLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  initialLanguage: string;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  initialLanguage 
}) => {
  const [language, setLanguage] = useState(initialLanguage || 'en');

  const t = (key: string, params?: Record<string, string>): string => {
    // Use the typed translations object
    const translatedText = 
      typedTranslations[language]?.[key] ?? 
      typedTranslations['en'][key] ?? 
      key;
    
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{{${param}}}`, value),
        translatedText
      );
    }
    
    return translatedText;
  };

  const changeLanguage = (lang: string) => {
    if (typedTranslations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <TranslationContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Type guard to check if a language is available
export const isAvailableLanguage = (lang: string): lang is string => {
  return Object.keys(typedTranslations).includes(lang);
};