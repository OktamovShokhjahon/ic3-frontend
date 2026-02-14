"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "ic3_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && (stored === "light" || stored === "dark")) {
      setTheme(stored);
    } else {
      // Check system preference
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemPreference);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      // Apply immediately to avoid flicker
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
      return newTheme;
    });
  };

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Don't throw error in development, return default
    if (process.env.NODE_ENV === "development") {
      console.warn("useTheme must be used within ThemeProvider");
      return { theme: "light", toggleTheme: () => {} };
    }
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
