'use client';

import { useTranslations } from '../i18n/TranslationsProvider';

const LANG_LABELS: Record<'en' | 'ru' | 'uz', string> = {
  en: 'EN',
  ru: 'RU',
  uz: 'UZ'
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslations();

  return (
    <div className="flex items-center space-x-1 rounded-full bg-gray-100 px-1 py-0.5">
      {(Object.keys(LANG_LABELS) as Array<'en' | 'ru' | 'uz'>).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-2 py-0.5 text-xs font-semibold rounded-full transition ${
            locale === code
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          {LANG_LABELS[code]}
        </button>
      ))}
    </div>
  );
}

