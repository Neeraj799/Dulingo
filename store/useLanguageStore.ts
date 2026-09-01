import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language, LanguageCode } from "@/types/learning";
import { languages } from "@/data/languages";

const STORAGE_KEY = "dulingo_selectedLanguage";

/**
 * Zustand-compatible storage adapter:
 *   - Web   → window.localStorage directly
 *   - Native → AsyncStorage (@react-native-async-storage/async-storage)
 *
 * Both branches implement the full { getItem, setItem, removeItem } contract,
 * so Zustand persist can safely call any method on any platform.
 */
const buildStorage = () => {
  // SSR guard: window is undefined during Expo web server rendering.
  if (typeof window === "undefined") {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }

  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => {
        try {
          return Promise.resolve(window.localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    };
  }

  return {
    getItem: (key: string): Promise<string | null> =>
      AsyncStorage.getItem(key).catch(() => null),
    setItem: (key: string, value: string): Promise<void> =>
      AsyncStorage.setItem(key, value).catch(() => {}),
    removeItem: (key: string): Promise<void> =>
      AsyncStorage.removeItem(key).catch(() => {}),
  };
};

const storageAdapter = buildStorage();

interface LanguageState {
  /** The code of the language the user has chosen to learn, or null if not yet set. */
  selectedLanguageCode: LanguageCode | null;
  /** True once the persisted state has been rehydrated from storage. */
  hasHydrated: boolean;

  /** Persist the chosen language and update in-memory state. */
  setSelectedLanguage: (code: LanguageCode) => void;
  /**
   * Clear the chosen language.
   *
   * Delegates the storage removal to Zustand's configured persistence layer
   * (via `persist.clearStorage`) so the correct adapter is always used,
   * regardless of platform. In-memory state is then reset synchronously.
   */
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
        // Reset in-memory state first.
        set({ selectedLanguageCode: null });
        // Remove from the configured storage adapter (works on all platforms).
        await useLanguageStore.persist.clearStorage();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storageAdapter),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error("Failed to rehydrate language store:", error);
        }
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
