import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * SSR-safe storage adapter — mirrors the pattern used in useLanguageStore.
 *
 * During server-side rendering (Expo web), `window` is not defined, so
 * AsyncStorage's localStorage-backed implementation throws. We provide a
 * no-op adapter for the SSR pass; on native and client-side web it uses
 * the proper AsyncStorage implementation.
 */
const buildStorage = () => {
  // SSR guard: window is undefined during server rendering.
  if (typeof window === "undefined") {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }

  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }

  // Native: SecureStore for encrypted persistence.
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

const getTodayDate = () => new Date().toISOString().split("T")[0];

interface ProgressState {
  /** Total XP earned by the user */
  totalXP: number;
  /** Current daily XP earned today */
  dailyXP: number;
  /** Daily XP goal */
  dailyXPGoal: number;
  /** Current login streak in days */
  streak: number;
  /** IDs of lessons the user has completed */
  completedLessonIds: string[];
  /** Date string (YYYY-MM-DD) when dailyXP was last updated or reset */
  lastDailyXPDate: string;
  /** Actions */
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string, xp: number) => void;
  resetDailyXP: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      totalXP: 0,
      dailyXP: 0,
      dailyXPGoal: 20,
      streak: 0,
      completedLessonIds: [],
      lastDailyXPDate: getTodayDate(),

      addXP: (amount: number) =>
        set((s) => {
          const today = getTodayDate();
          const isSameDay = s.lastDailyXPDate === today;
          return {
            totalXP: s.totalXP + amount,
            dailyXP: isSameDay ? s.dailyXP + amount : amount,
            lastDailyXPDate: today,
          };
        }),

      completeLesson: (lessonId: string, xp: number) =>
        set((s) => {
          const today = getTodayDate();
          const isSameDay = s.lastDailyXPDate === today;
          return {
            completedLessonIds: s.completedLessonIds.includes(lessonId)
              ? s.completedLessonIds
              : [...s.completedLessonIds, lessonId],
            totalXP: s.totalXP + xp,
            dailyXP: isSameDay ? s.dailyXP + xp : xp,
            lastDailyXPDate: today,
          };
        }),

      resetDailyXP: () =>
        set({
          dailyXP: 0,
          lastDailyXPDate: getTodayDate(),
        }),
    }),
    {
      name: "dulingo_progress",
      storage: createJSONStorage(() => storageAdapter),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const today = getTodayDate();
          if (state.lastDailyXPDate !== today) {
            useProgressStore.setState({
              dailyXP: 0,
              lastDailyXPDate: today,
            });
          }
        }
      },
    }
  )
);
