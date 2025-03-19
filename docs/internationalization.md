# Internationalization in Trua Verify

This document explains how internationalization (i18n) is implemented in the Trua Verify system, with a focus on how the language specified in the Collection Key drives the language for all visual components.

## Collection Key Language Prefix

The Collection Key is a 14-character hybrid string where the first 2 characters specify the language:

```
en101110101100
^^ Language prefix (en = English)
```

Supported language prefixes:
- `en`: English
- `es`: Spanish
- `fr`: French
- `it`: Italian

## Internationalization Architecture

### 1. Language Determination

The language is determined at the application entry point by parsing the Collection Key:

```typescript
// Parse the Collection Key to extract the language
function parseCollectionKey(key: string): { language: string, bits: string } {
  return {
    language: key.substring(0, 2),
    bits: key.substring(2)
  };
}

// Example usage
const { language } = parseCollectionKey("en101110101100"); // language = "en"
```

### 2. Translation Context

The language is stored in a React Context that makes it available throughout the application:

```typescript
// TranslationContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from './translations';

interface TranslationContextType {
  language: string;
  t: (key: string, params?: Record<string, string>) => string;
  changeLanguage: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{
  children: ReactNode;
  initialLanguage: string;
}> = ({ children, initialLanguage }) => {
  const [language, setLanguage] = useState(initialLanguage);

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    const translatedText = translations[language]?.[key] || translations['en'][key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{{${param}}}`, value),
        translatedText
      );
    }
    
    return translatedText;
  };

  // Function to change language
  const changeLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <TranslationContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translations
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
```

### 3. Application Initialization

The application is initialized with the language from the Collection Key:

```typescript
// App.tsx
import React from 'react';
import { TranslationProvider } from './context/TranslationContext';
import { FormProvider } from './context/FormProvider';
import { CollectionWizard } from './components/CollectionWizard';

interface AppProps {
  collectionKey: string;
  trackingId: string;
}

const App: React.FC<AppProps> = ({ collectionKey, trackingId }) => {
  const { language, bits } = parseCollectionKey(collectionKey);
  
  return (
    <TranslationProvider initialLanguage={language}>
      <FormProvider
        initialRequirements={getRequirements(collectionKey)}
        trackingId={trackingId}
      >
        <CollectionWizard />
      </FormProvider>
    </TranslationProvider>
  );
};

export default App;
```

### 4. Translation Files

Translation strings are stored in JSON files, one for each supported language:

```typescript
// translations.ts
export const translations = {
  en: {
    "personal_info.title": "Personal Information",
    "personal_info.name_label": "Full Name",
    "personal_info.email_label": "Email Address",
    "personal_info.phone_label": "Phone Number",
    "personal_info.dob_label": "Date of Birth",
    "personal_info.ssn_label": "Social Security Number",
    // ... more translations
  },
  es: {
    "personal_info.title": "Información Personal",
    "personal_info.name_label": "Nombre Completo",
    "personal_info.email_label": "Correo Electrónico",
    "personal_info.phone_label": "Número de Teléfono",
    "personal_info.dob_label": "Fecha de Nacimiento",
    "personal_info.ssn_label": "Número de Seguro Social",
    // ... more translations
  },
  fr: {
    "personal_info.title": "Informations Personnelles",
    "personal_info.name_label": "Nom Complet",
    "personal_info.email_label": "Adresse Email",
    "personal_info.phone_label": "Numéro de Téléphone",
    "personal_info.dob_label": "Date de Naissance",
    "personal_info.ssn_label": "Numéro de Sécurité Sociale",
    // ... more translations
  },
  it: {
    "personal_info.title": "Informazioni Personali",
    "personal_info.name_label": "Nome Completo",
    "personal_info.email_label": "Indirizzo Email",
    "personal_info.phone_label": "Numero di Telefono",
    "personal_info.dob_label": "Data di Nascita",
    "personal_info.ssn_label": "Numero di Previdenza Sociale",
    // ... more translations
  }
};
```

## Using Translations in Components

All visual components should use the translation context to display text in the selected language:

```typescript
// PersonalInfo.tsx
import React from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useFormContext } from '../context/FormContext';

export const PersonalInfo: React.FC = () => {
  const { t } = useTranslation();
  const { formState, updateFormState } = useFormContext();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormState({
      claimant: {
        ...formState.claimant,
        [name]: value
      }
    });
  };
  
  return (
    <div className="form-step">
      <h2>{t('personal_info.title')}</h2>
      
      <div className="form-group">
        <label htmlFor="full_name">{t('personal_info.name_label')}</label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formState.claimant.full_name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">{t('personal_info.email_label')}</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formState.claimant.email}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* More form fields */}
    </div>
  );
};
```

## Internationalization for Dynamic Content

For dynamic content, such as validation messages or data-driven text, use the translation function with parameters:

```typescript
// ValidationMessage.tsx
import React from 'react';
import { useTranslation } from '../context/TranslationContext';

interface ValidationMessageProps {
  messageKey: string;
  params?: Record<string, string>;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ messageKey, params }) => {
  const { t } = useTranslation();
  
  return (
    <div className="validation-message">
      {t(messageKey, params)}
    </div>
  );
};

// Usage example
<ValidationMessage 
  messageKey="validation.min_years" 
  params={{ required: "5", current: "3.5" }} 
/>

// In translations.ts
"validation.min_years": "Please provide at least {{required}} years of history. Currently: {{current}} years."
```

## Date and Number Formatting

Use locale-specific formatting for dates and numbers:

```typescript
// dateUtils.ts
export function formatDate(date: string, language: string): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return dateObj.toLocaleDateString(getLocale(language), options);
}

export function formatNumber(num: number, language: string): string {
  return num.toLocaleString(getLocale(language));
}

function getLocale(language: string): string {
  switch (language) {
    case 'en': return 'en-US';
    case 'es': return 'es-ES';
    case 'fr': return 'fr-FR';
    case 'it': return 'it-IT';
    default: return 'en-US';
  }
}

// Usage in components
import { formatDate, formatNumber } from '../utils/dateUtils';
import { useTranslation } from '../context/TranslationContext';

const MyComponent: React.FC = () => {
  const { language } = useTranslation();
  
  return (
    <div>
      <p>Date: {formatDate('2025-03-19', language)}</p>
      <p>Number: {formatNumber(1234.56, language)}</p>
    </div>
  );
};
```

## Right-to-Left (RTL) Language Support

For future support of RTL languages:

```typescript
// App.tsx
import React from 'react';
import { TranslationProvider } from './context/TranslationContext';

const App: React.FC<AppProps> = ({ collectionKey, trackingId }) => {
  const { language, bits } = parseCollectionKey(collectionKey);
  const isRTL = ['ar', 'he'].includes(language); // Arabic, Hebrew
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <TranslationProvider initialLanguage={language}>
        {/* App content */}
      </TranslationProvider>
    </div>
  );
};
```

## Language Switching

While the initial language is determined by the Collection Key, the application also supports manual language switching:

```typescript
// LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from '../context/TranslationContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage, t } = useTranslation();
  
  return (
    <div className="language-switcher">
      <label htmlFor="language-select">{t('language.select')}</label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="it">Italiano</option>
      </select>
    </div>
  );
};
```

## PDF Generation with Correct Language

When generating the PDF, the language from the Collection Key is used to ensure all text is in the correct language:

```typescript
// On the server side
function generatePDF(claim: Claim): Buffer {
  const { language } = claim;
  const translations = loadTranslations(language);
  
  // Use translations for all text in the PDF
  const pdf = new PDFDocument();
  pdf.text(translations['pdf.title']);
  pdf.text(translations['pdf.claimant_section']);
  pdf.text(`${translations['pdf.name_label']}: ${claim.claimant.full_name}`);
  // ... more PDF content
  
  return pdf.output();
}
```

## Implementation Considerations

1. **Translation Keys**: Use structured keys (e.g., `section.subsection.element`) for better organization.
2. **Fallback Language**: Always provide English translations as a fallback.
3. **Translation Completeness**: Ensure all user-facing text is translated in all supported languages.
4. **Dynamic Text**: Use parameters for text that includes dynamic values.
5. **Date and Number Formatting**: Always use locale-specific formatting for dates and numbers.
6. **Testing**: Test the application in all supported languages to ensure proper display.

## Conclusion

By using the language prefix from the Collection Key to initialize the translation context, all visual components in the application will display text in the specified language. This approach ensures a consistent user experience across the entire application while allowing for flexibility in supporting multiple languages.