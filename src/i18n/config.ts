import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
const resources = {
  en: {
    translation: {
      common: {
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        current: 'Current',
        present: 'Present',
        start_date: 'Start Date',
        end_date: 'End Date'
      },
      residence: {
        country: 'Country',
        address: 'Address',
        city: 'City',
        state_province: 'State/Province',
        zip_postal: 'ZIP/Postal Code',
        select_country: 'Select a country',
        country_input_label: 'Country search',
        country_list_label: 'Country suggestions'
      },
      countries: {
        no_matches: 'No matching countries found',
        matches_found: '{{count}} countries found',
        selected_option: '{{country}} ({{position}} of {{total}})',
        selection_confirmed: '{{country}} selected',
        US: 'United States',
        // Add other country translations as needed
      }
    }
  }
  // Add other language resources as needed
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n; 