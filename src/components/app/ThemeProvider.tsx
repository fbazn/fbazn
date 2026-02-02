"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: string | null): value is Theme =>
  value === "light" || value === "dark" || value === "system";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(storedTheme)) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(MEDIA_QUERY);

    const applyTheme = (value: ResolvedTheme) => {
      setResolvedTheme(value);
      if (value === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    if (theme === "system") {
      applyTheme(media.matches ? "dark" : "light");
    } else {
      applyTheme(theme);
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme !== "system") {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      applyTheme(event.matches ? "dark" : "light");
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
