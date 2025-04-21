"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeCheck() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // This ensures the dark mode class is applied to the document
    // even when there might be issues with next-themes
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Log for debugging
    console.log("Current theme:", theme);
    console.log("Resolved theme:", resolvedTheme);
  }, [theme, resolvedTheme]);

  return null;
}
