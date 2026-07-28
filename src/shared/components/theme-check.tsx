"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeCheck() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    // Force light mode as default if no theme is set
    if (!theme || theme === "system") {
      setTheme("light");
    }

    // This ensures the correct mode class is applied to the document
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Log for debugging
    console.log("Current theme:", theme);
    console.log("Resolved theme:", resolvedTheme);
  }, [theme, resolvedTheme, setTheme]);

  return null;
}
