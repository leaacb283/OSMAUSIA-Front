import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
    fr: { translation: fr },
    en: { translation: en }
};

// Get saved language or browser language
const getSavedLanguage = () => {
    const saved = localStorage.getItem('osmausia-language');
    if (saved) return saved;

    const browserLang = navigator.language.split('-')[0];
    return ['fr', 'en'].includes(browserLang) ? browserLang : 'fr';
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getSavedLanguage(),
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false
        }
    });

// Save language preference
export const setLanguage = (lang) => {
    localStorage.setItem('osmausia-language', lang);
    i18n.changeLanguage(lang);
};

export default i18n;
