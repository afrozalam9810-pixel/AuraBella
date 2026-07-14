"use client";
/**
 * ThemeContext.jsx
 * Dark/light mode provider for AuraBella.
 *
 * Hydration flash fix:
 *   Reading localStorage in a useEffect fires AFTER the first paint, causing
 *   a visible flash from "dark" (SSR default) to "light". We fix this by:
 *   1. Injecting a blocking <script> into index.html that reads localStorage
 *      and applies the class synchronously BEFORE React hydrates (see index.html).
 *   2. Using a lazy initializer for useState that reads localStorage on the
 *      first render to avoid scheduling a second unnecessary useEffect.
 */

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "aurabella-theme";

/** Read the theme that was already applied by the inline script in index.html */
const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark"; // SSR guard
  try {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  } catch {
    return "dark";
  }
};

export function ThemeProvider({ children }) {
  // Lazy initializer — reads localStorage on first render, not in a later effect.
  // This keeps the React state in sync with what the inline script already applied.
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Ensure the class and colorScheme always match the resolved theme.
    // (Handles edge-cases: browser extension changes, cookie consent resets, etc.)
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore write errors in restricted environments
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
