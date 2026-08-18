import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language, LanguageCode } from "@/types/learning";
import { languages } from "@/data/languages";

const STORAGE_KEY = "dulingo_selectedLanguage";

/**
 * Zustand-compatible storage adapter backed by expo-secure-store.
 * Falls back to a no-op on web (where SecureStore is unavailable).
 */
const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") return null;
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") return;
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") return;
    await SecureStore.deleteItemAsync(key);
  },
};

interface LanguageState {
  /** The code of the language the user has chosen to learn, or null if not yet set. */
  selectedLanguageCode: LanguageCode | null;
  /** Whether the persisted state has been rehydrated from SecureStore. */
  hasHydrated: boolean;

  /** Persist the chosen language and update local state. */
  setSelectedLanguage: (code: LanguageCode) => void;
  /** Clear the chosen language (used for testing / reset flows). */
  clearSelectedLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguageCode: null,
      hasHydrated: false,

      setSelectedLanguage: (code: LanguageCode) =>
        set({ selectedLanguageCode: code }),

      clearSelectedLanguage: async () => {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        set({ selectedLanguageCode: null });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureStoreAdapter),
      onRehydrateStorage: () => () => {
        // Mark hydration complete so the layout guard can evaluate routing.
        useLanguageStore.setState({ hasHydrated: true });
      },
    }
  )
);

/** Convenience selector — returns the full Language object or null. */
export function useSelectedLanguage(): Language | null {
  const code = useLanguageStore((s) => s.selectedLanguageCode);
  if (!code) return null;
  return languages.find((l) => l.code === code) ?? null;
}
