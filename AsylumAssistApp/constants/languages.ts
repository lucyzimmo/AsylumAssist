// Language configuration for the AsylumAssist App
// Currently supports English, Spanish, and French

export type SupportedLanguage = 'en' | 'es' | 'fr';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'es', 
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'fr',
    name: 'French', 
    nativeName: 'Français',
    flag: '🇫🇷'
  }
];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export function getLanguageByCode(code: string): LanguageOption {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
}