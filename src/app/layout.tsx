import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Barlow, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/app/ThemeProvider";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FBAZN — Amazon FBA Sourcing Platform",
  description: "Review Queue, Sourcing List, supplier tracking and market data for Amazon FBA sellers.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
};

const themeScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem("theme");
    const theme =
      storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "system";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = theme === "dark" || (theme === "system" && prefersDark);
    if (shouldDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (_error) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${barlow.variable} ${barlowCondensed.variable} antialiased`}>
        <PostHogProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
