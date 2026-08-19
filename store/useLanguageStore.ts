import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language, LanguageCode } from "@/types/learning";
import { languages } from "@/data/languages";

const STORAGE_KEY = "dulingo_selectedLanguage";

/**
 * Zustand-compatible storage adapter:
 *   - Web   → AsyncStorage (backed by localStorage via the installed v3 package)
 *   - Native → expo-secure-store (encrypted keychain / keystore)
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
    // AsyncStorage v3 ships a web implementation backed by localStorage.
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }

  // Native: lazy-require SecureStore so the module is never evaluated on web.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require("expo-secure-store") as typeof import("expo-secure-store");
  return {
    getItem: (key: string): Promise<string | null> =>
      SecureStore.getItemAsync(key),
    setItem: (key: string, value: string): Promise<void> =>
      SecureStore.setItemAsync(key, value),
    removeItem: (key: string): Promise<void> =>
      SecureStore.deleteItemAsync(key),
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
        // Remove from the configured storage adapter (works on all platforms).
        await useLanguageStore.persist.clearStorage();
        // Reset in-memory state after storage is cleared.
        set({ selectedLanguageCode: null });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storageAdapter),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error("Failed to rehydrate language store:", error);
          return;
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
