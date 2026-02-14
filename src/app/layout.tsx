import "./globals.css";
import { Inter } from "next/font/google";
import { LockdownClient } from "./LockdownClient";
import { ClientProviders } from "../components/ClientProviders";

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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
