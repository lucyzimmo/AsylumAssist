import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import polyfill for Intl.PluralRules
import 'intl-pluralrules';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

// Language detection plugin
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // Check if user has manually set a language
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }

      // Fall back to device language
      const deviceLanguage = Localization.locale;
      const languageCode = deviceLanguage.split('-')[0];

      // Check if we support the device language
      const supportedLanguages = ['en', 'es', 'fr', 'ar'];
      const selectedLanguage = supportedLanguages.includes(languageCode) ? languageCode : 'en';

      callback(selectedLanguage);
    } catch (error) {
      console.log('Error detecting language:', error);
      callback('en'); // fallback to English
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.log('Error caching language:', error);
    }
  },
};

// Initialize i18next
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    debug: __DEV__, // Enable debug in development

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    // Handle pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Use modern pluralization format
    pluralization: {
      enabled: true,
    },

    // Cache configuration
    cache: {
      enabled: true,
    },

    // RTL support
    supportedLngs: ['en', 'es', 'fr', 'ar'],
    nonExplicitSupportedLngs: true,
  });

export default i18n;

// Helper function to get if current language is RTL
export const isRTL = (language?: string): boolean => {
  const currentLang = language || i18n.language;
  return currentLang === 'ar';
};

// Helper function to change language
export const changeLanguage = async (language: string): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem('user-language', language);
  } catch (error) {
    console.log('Error changing language:', error);
  }
};

// Available languages
export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];