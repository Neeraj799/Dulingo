import type { Unit } from "@/types/learning";

/**
 * All units across all available languages.
 *
 * Only units whose lessonIds are fully resolved in data/lessons.ts
 * are listed here. Empty/stub units have been removed to prevent
 * learners reaching a blank lesson list.
 *
 * Current coverage:
 *  es → 2 units (Greetings & Basics, Numbers & Colors)
 *  fr → 1 unit  (Bonjour! Greetings)
 *  ja → 1 unit  (こんにちは! Greetings)
 *  de → 0 units (no lessons authored yet — language marked isAvailable: false)
 *  ko → 0 units (no lessons authored yet — language marked isAvailable: false)
 */
export const units: Unit[] = [
  // ──────────────────────────────────────
  // SPANISH  (2 units)
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

  // ──────────────────────────────────────
  // FRENCH  (1 unit)
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

  // ──────────────────────────────────────
  // JAPANESE  (1 unit)
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
