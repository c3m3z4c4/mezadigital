import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  email: string | null;
  login:  (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,

      login: async (email, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Login failed");
        }
        const data = await res.json();
        set({ token: data.token, email: data.email });
      },

      logout: () => set({ token: null, email: null }),
    }),
    {
      name: "meza-auth",
      partialize: (s) => ({ token: s.token, email: s.email }),
    }
  )
);
