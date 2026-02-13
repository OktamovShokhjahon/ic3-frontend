'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../messages/en.json';
import ru from '../messages/ru.json';
import uz from '../messages/uz.json';

type Locale = 'en' | 'ru' | 'uz';

type Messages = typeof en;

interface TranslationsContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, values?: Record<string, string | number>) => string;
}

const TranslationsContext = createContext<TranslationsContextValue | undefined>(undefined);

const MESSAGES: Record<Locale, Messages> = { en, ru, uz };
const STORAGE_KEY = 'ic3_locale';

function resolvePath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function format(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = values[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

export function TranslationsProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === 'en' || stored === 'ru' || stored === 'uz')) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const value = useMemo<TranslationsContextValue>(
    () => ({
      locale,
      setLocale,
      t: (path: string, values?: Record<string, string | number>) => {
        const messages = MESSAGES[locale] ?? MESSAGES.en;
        const raw = resolvePath(messages, path);
        if (typeof raw !== 'string') return path;
        return format(raw, values);
      }
    }),
    [locale]
  );

  return <TranslationsContext.Provider value={value}>{children}</TranslationsContext.Provider>;
}

export function useTranslations() {
  const ctx = useContext(TranslationsContext);
  if (!ctx) {
    throw new Error('useTranslations must be used within TranslationsProvider');
  }
  return ctx;
}

