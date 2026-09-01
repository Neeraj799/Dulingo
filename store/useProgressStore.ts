import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * SSR-safe and cross-platform storage adapter.
 *
 * On Web: uses window.localStorage directly (if window is defined) to avoid
 * null native module errors with @react-native-async-storage/async-storage.
 * On Native: uses @react-native-async-storage/async-storage with try-catch guards.
 * On SSR / window undefined: returns a safe no-op adapter.
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
    getItem: async (key: string) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (e) {
        console.warn("AsyncStorage getItem error:", e);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (e) {
        console.warn("AsyncStorage setItem error:", e);
      }
    },
    removeItem: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (e) {
        console.warn("AsyncStorage removeItem error:", e);
      }
    },
  };
};

const storageAdapter = buildStorage();

let pendingActions: Array<() => void> = [];

const flushPendingActions = () => {
  const actions = pendingActions;
  pendingActions = [];
  actions.forEach((action) => action());
};

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysDifference = (dateStr1: string, dateStr2: string) => {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1 + "T00:00:00");
  const d2 = new Date(dateStr2 + "T00:00:00");
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const calculateXPUpdate = (
  s: { dailyXP: number; streak: number; lastDailyXPDate: string },
  xp: number
) => {
  const today = getTodayDate();
  const diffDays = getDaysDifference(s.lastDailyXPDate, today);
  let newDailyXP: number;
  let newStreak: number;
  let newLastDailyXPDate = today;

  if (diffDays <= 0) {
    newDailyXP = s.dailyXP + xp;
    newStreak = s.streak === 0 ? 1 : s.streak;
    if (diffDays < 0 && s.lastDailyXPDate) {
      newLastDailyXPDate = s.lastDailyXPDate;
    }
  } else if (diffDays === 1) {
    newDailyXP = xp;
    newStreak = s.streak + 1;
  } else {
    newDailyXP = xp;
    newStreak = 1;
  }

  return {
    dailyXP: newDailyXP,
    streak: newStreak,
    lastDailyXPDate: newLastDailyXPDate,
  };
};

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
  /** True once the persisted state has been rehydrated from storage. */
  hasHydrated: boolean;
  /** Actions */
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string, xp: number) => void;
  resetDailyXP: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      dailyXP: 0,
      dailyXPGoal: 20,
      streak: 0,
      completedLessonIds: [],
      lastDailyXPDate: getTodayDate(),
      hasHydrated: false,

      addXP: (amount: number) => {
        if (!get().hasHydrated) {
          pendingActions.push(() => get().addXP(amount));
          return;
        }
        set((s) => {
          const updates = calculateXPUpdate(s, amount);
          return {
            totalXP: s.totalXP + amount,
            ...updates,
          };
        });
      },

      completeLesson: (lessonId: string, xp: number) => {
        if (!get().hasHydrated) {
          pendingActions.push(() => get().completeLesson(lessonId, xp));
          return;
        }
        set((s) => {
          if (s.completedLessonIds.includes(lessonId)) {
            return s;
          }
          const updates = calculateXPUpdate(s, xp);
          return {
            completedLessonIds: [...s.completedLessonIds, lessonId],
            totalXP: s.totalXP + xp,
            ...updates,
          };
        });
      },

      resetDailyXP: () => {
        if (!get().hasHydrated) {
          pendingActions.push(() => get().resetDailyXP());
          return;
        }
        set({
          dailyXP: 0,
        });
      },
    }),
    {
      name: "dulingo_progress",
      storage: createJSONStorage(() => storageAdapter),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate progress store:", error);
          useProgressStore.setState({ hasHydrated: true });
          flushPendingActions();
          return;
        }
        if (state) {
          reconcileProgressState(state);
        }
        useProgressStore.setState({ hasHydrated: true });
        flushPendingActions();
      },
    }
  )
);

export function reconcileProgressState(targetState?: {
  lastDailyXPDate: string;
  streak: number;
  dailyXP: number;
  hasHydrated?: boolean;
}) {
  const currentState = targetState ?? useProgressStore.getState();
  if (!currentState || !currentState.lastDailyXPDate) return;
  if (!targetState && !currentState.hasHydrated) return;

  const today = getTodayDate();
  const diffDays = getDaysDifference(currentState.lastDailyXPDate, today);
  if (diffDays > 0) {
    const updatedStreak = diffDays === 1 ? currentState.streak : 0;
    if (currentState.dailyXP !== 0 || currentState.streak !== updatedStreak) {
      useProgressStore.setState({
        dailyXP: 0,
        streak: updatedStreak,
      });
    }
  }
}

if (typeof window !== "undefined") {
  AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "active") {
      reconcileProgressState();
    }
  });
}

