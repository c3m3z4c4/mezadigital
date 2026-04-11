import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

type AnyTranslation = (typeof translations)[Lang];

interface LangState {
  lang: Lang;
  t: AnyTranslation;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: "es",
      t: translations.es,
      setLang: (lang) => set({ lang, t: translations[lang] }),
      toggle: () =>
        set((s) => {
          const next = s.lang === "es" ? "en" : "es";
          return { lang: next, t: translations[next] };
        }),
    }),
    {
      name: "meza-lang",
      partialize: (s) => ({ lang: s.lang }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.lang];
        }
      },
    }
  )
);
