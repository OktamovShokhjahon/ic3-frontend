"use client";

import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function TestPage2() {
  return (
    <div className="relative" style={{ width: "100%", height: "100vh" }}>
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <iframe
        src="/lvl-1-2/index.html"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  );
}
