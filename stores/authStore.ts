import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isTokenExpired, getTokenExpiry } from "@/lib/auth";

interface AuthState {
  token: string | null;
  email: string | null;
  login:  (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkExpiry: () => boolean;
}

let _logoutTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoLogout(token: string, logoutFn: () => void) {
  if (_logoutTimer) clearTimeout(_logoutTimer);
  const exp = getTokenExpiry(token);
  if (!exp) return;
  const delay = exp - Date.now();
  if (delay <= 0) { logoutFn(); return; }
  _logoutTimer = setTimeout(logoutFn, delay);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
        scheduleAutoLogout(data.token, get().logout);
      },

      logout: () => {
        if (_logoutTimer) { clearTimeout(_logoutTimer); _logoutTimer = null; }
        set({ token: null, email: null });
      },

      checkExpiry: () => {
        const { token, logout } = get();
        if (!token) return false;
        if (isTokenExpired(token)) { logout(); return false; }
        scheduleAutoLogout(token, logout);
        return true;
      },
    }),
    {
      name: "meza-auth",
      partialize: (s) => ({ token: s.token, email: s.email }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          if (isTokenExpired(state.token)) {
            state.token = null;
            state.email = null;
          } else {
            scheduleAutoLogout(state.token, state.logout);
          }
        }
      },
    }
  )
);
