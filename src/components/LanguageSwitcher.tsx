"use client";

import { useState } from "react";
import { useTranslations } from "../i18n/TranslationsProvider";
import { Globe, ChevronDown } from "lucide-react";

const LANG_LABELS: Record<"en" | "ru" | "uz", string> = {
  en: "English",
  ru: "Русский",
  uz: "O'zbek",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        <Globe className="w-4 h-4" />
        <span>{LANG_LABELS[locale]}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {(Object.keys(LANG_LABELS) as Array<"en" | "ru" | "uz">).map(
              (code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLocale(code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                    locale === code
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {LANG_LABELS[code]}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
