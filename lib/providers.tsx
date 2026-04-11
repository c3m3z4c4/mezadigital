"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { useLangStore } from "@/stores/langStore";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const lang  = useLangStore((s) => s.lang);

  // Apply theme attribute on mount + change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Apply lang attribute
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-border)",
          },
        }}
      />
    </>
  );
}
