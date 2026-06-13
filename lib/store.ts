import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

interface AuthStore {
  user:      User | null;
  token:     string | null;
  isLoggedIn: boolean;
  setAuth:   (user: User, token: string) => void;
  logout:    () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:       null,
      token:      null,
      isLoggedIn: false,

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    { name: "auth-storage" }
  )
);