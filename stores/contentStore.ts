import { create } from "zustand";

interface ContentState {
  content: Record<string, string>;
  loaded: boolean;
  fetch: () => Promise<void>;
  get: (key: string, fallback: string) => string;
  set: (updates: Record<string, string>, token: string) => Promise<void>;
}

export const useContentStore = create<ContentState>()((set, get) => ({
  content: {},
  loaded: false,

  fetch: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        set({ content: data, loaded: true });
      }
    } catch { /* use i18n fallbacks */ }
  },

  get: (key, fallback) => get().content[key] ?? fallback,

  set: async (updates, token) => {
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to save content");
    const saved = await res.json();
    set(s => ({ content: { ...s.content, ...saved } }));
  },
}));
