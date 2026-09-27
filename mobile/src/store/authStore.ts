import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { ACCESS_KEY, REFRESH_KEY } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, refresh?: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: async (user, token, refresh) => {
        await SecureStore.setItemAsync(ACCESS_KEY, token);
        if (refresh) await SecureStore.setItemAsync(REFRESH_KEY, refresh);
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: async () => {
        await SecureStore.deleteItemAsync(ACCESS_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "ym-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
