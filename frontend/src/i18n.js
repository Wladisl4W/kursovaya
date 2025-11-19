import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импорт переводов
import translationEN from './locales/en/translation.json';
import translationRU from './locales/ru/translation.json';

// Конфигурация ресурсов
const resources = {
  en: {
    translation: translationEN
  },
  ru: {
    translation: translationRU
  }
};

i18n
  .use(LanguageDetector) // автоматическое определение языка
  .use(initReactI18next) // подключение react-i18next
  .init({
    resources,
    fallbackLng: 'en', // язык по умолчанию
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false // react уже защищает от XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;