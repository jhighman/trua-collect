import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '../utils/translations';

// Define the structure of a translation dictionary
interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
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

  const getNestedValue = (obj: TranslationDictionary, path: string): string | undefined => {
    const parts = path.split('.');
    let current: string | TranslationDictionary | undefined = obj;
    
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      if (typeof current === 'string') return undefined;
      current = current[part];
    }
    
    return typeof current === 'string' ? current : undefined;
  };

  const t = (key: string, params?: Record<string, string>): string => {
    // Get the translation using the nested path
    const translatedText =
      getNestedValue(typedTranslations[language], key) ??
      getNestedValue(typedTranslations['en'], key) ??
      key;
    
    // Log translation lookup for debugging
    console.log(`Translation lookup - Key: ${key}, Language: ${language}, Result:`, translatedText);
    
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{{${param}}}`, value),
        translatedText
      );
    }
    
    return translatedText;
  };

  const changeLanguage = (lang: string) => {
    console.log(`Changing language to: ${lang}`);
    if (typedTranslations[lang]) {
      setLanguage(lang);
      console.log(`Language changed to: ${lang}`);
    } else {
      console.warn(`Language ${lang} not available, staying with ${language}`);
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