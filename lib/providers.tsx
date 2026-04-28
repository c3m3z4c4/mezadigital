"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { useLangStore } from "@/stores/langStore";
import { useAuthStore } from "@/stores/authStore";
import { useContentStore } from "@/stores/contentStore";
import { Toaster } from "sonner";

function AuthWatcher() {
  const checkExpiry = useAuthStore(s => s.checkExpiry);

  useEffect(() => {
    checkExpiry();
    // Re-check every minute in case the tab was backgrounded
    const id = setInterval(checkExpiry, 60_000);
    return () => clearInterval(id);
  }, [checkExpiry]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const theme  = useThemeStore(s => s.theme);
  const lang   = useLangStore(s => s.lang);
  const fetchContent = useContentStore(s => s.fetch);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return (
    <>
      <AuthWatcher />
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
