"use client";

import { ThemeProvider } from "../i18n/ThemeProvider";
import { TranslationsProvider } from "../i18n/TranslationsProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TranslationsProvider>{children}</TranslationsProvider>
    </ThemeProvider>
  );
}
