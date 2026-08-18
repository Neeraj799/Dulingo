import type { Unit } from "@/types/learning";

/**
 * All units across all available languages.
 *
 * Each unit groups a set of lessons around a clear theme.
 * Units are ordered within a language (order field).
 */
export const units: Unit[] = [
  // ──────────────────────────────────────
  // SPANISH
  // ──────────────────────────────────────
  {
    id: "es-unit-1",
    languageCode: "es",
    title: "Greetings & Basics",
    description: "Say hello, introduce yourself, and learn polite phrases.",
    order: 1,
    color: "#58CC02",
    icon: "👋",
    totalLessons: 3,
    lessonIds: ["es-u1-l1", "es-u1-l2", "es-u1-l3"],
  },
  {
    id: "es-unit-2",
    languageCode: "es",
    title: "Numbers & Colors",
    description: "Count to 20 and name common colors in Spanish.",
    order: 2,
    color: "#1CB0F6",
    icon: "🔢",
    totalLessons: 3,
    lessonIds: ["es-u2-l1", "es-u2-l2", "es-u2-l3"],
  },
  {
    id: "es-unit-3",
    languageCode: "es",
    title: "Food & Drinks",
    description: "Order food, describe tastes, and talk about meals.",
    order: 3,
    color: "#FF9600",
    icon: "🍽️",
    totalLessons: 3,
    lessonIds: ["es-u3-l1", "es-u3-l2", "es-u3-l3"],
  },

  // ──────────────────────────────────────
  // FRENCH
  // ──────────────────────────────────────
  {
    id: "fr-unit-1",
    languageCode: "fr",
    title: "Bonjour! Greetings",
    description: "Master French greetings, polite expressions, and introductions.",
    order: 1,
    color: "#58CC02",
    icon: "👋",
    totalLessons: 3,
    lessonIds: ["fr-u1-l1", "fr-u1-l2", "fr-u1-l3"],
  },
  {
    id: "fr-unit-2",
    languageCode: "fr",
    title: "Numbers & Time",
    description: "Learn numbers, days of the week, and how to tell time.",
    order: 2,
    color: "#1CB0F6",
    icon: "🕐",
    totalLessons: 3,
    lessonIds: ["fr-u2-l1", "fr-u2-l2", "fr-u2-l3"],
  },
  {
    id: "fr-unit-3",
    languageCode: "fr",
    title: "Café & Food",
    description: "Order at a café, read a simple menu, and talk about food.",
    order: 3,
    color: "#FF9600",
    icon: "☕",
    totalLessons: 3,
    lessonIds: ["fr-u3-l1", "fr-u3-l2", "fr-u3-l3"],
  },

  // ──────────────────────────────────────
  // GERMAN
  // ──────────────────────────────────────
  {
    id: "de-unit-1",
    languageCode: "de",
    title: "Hallo! Greetings",
    description: "Learn how to greet people and introduce yourself in German.",
    order: 1,
    color: "#58CC02",
    icon: "👋",
    totalLessons: 3,
    lessonIds: ["de-u1-l1", "de-u1-l2", "de-u1-l3"],
  },
  {
    id: "de-unit-2",
    languageCode: "de",
    title: "Numbers & Counting",
    description: "Count in German and learn essential number vocabulary.",
    order: 2,
    color: "#1CB0F6",
    icon: "🔢",
    totalLessons: 3,
    lessonIds: ["de-u2-l1", "de-u2-l2", "de-u2-l3"],
  },

  // ──────────────────────────────────────
  // JAPANESE
  // ──────────────────────────────────────
  {
    id: "ja-unit-1",
    languageCode: "ja",
    title: "こんにちは! Greetings",
    description: "Say hello, goodbye, and learn basic polite Japanese phrases.",
    order: 1,
    color: "#58CC02",
    icon: "🎌",
    totalLessons: 3,
    lessonIds: ["ja-u1-l1", "ja-u1-l2", "ja-u1-l3"],
  },
  {
    id: "ja-unit-2",
    languageCode: "ja",
    title: "Numbers & Counting",
    description: "Learn Japanese numbers and the basic counting system.",
    order: 2,
    color: "#FF4B4B",
    icon: "🔢",
    totalLessons: 3,
    lessonIds: ["ja-u2-l1", "ja-u2-l2", "ja-u2-l3"],
  },
];

/**
 * Get all units for a specific language, sorted by order.
 */
export function getUnitsByLanguage(languageCode: string): Unit[] {
  return units
    .filter((u) => u.languageCode === languageCode)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get a single unit by its ID.
 */
export function getUnitById(unitId: string): Unit | undefined {
  return units.find((u) => u.id === unitId);
}
