import "./globals.css";
import { Inter } from "next/font/google";
import { LockdownClient } from "./LockdownClient";
import { TranslationsProvider } from "../i18n/TranslationsProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Test Platform",
  description: "Secure Multi-Level Test Solving Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <LockdownClient /> */}
        <TranslationsProvider>{children}</TranslationsProvider>
      </body>
    </html>
  );
}
