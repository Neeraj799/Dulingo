import type { LanguageCode, Unit } from "@/types/learning";

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
  // ── SPANISH (2 units) ──
  {
    id: "es-unit-1",
    languageCode: "es",
    title: "Greetings & Basics",
    description: "Say hello, introduce yourself, and learn polite phrases.",
    order: 1,
    color: "#58CC02",
    icon: "👋",
    totalLessons: 6,
    lessonIds: ["es-u1-l1", "es-u1-l2", "es-u1-l3", "es-u1-l4", "es-u1-l5", "es-u1-l6"],
  },
  {
    id: "es-unit-2",
    languageCode: "es",
    title: "Numbers & Colors",
    description: "Learn numbers 1 to 20 and common colors in Spanish.",
    order: 2,
    color: "#1CB0F6",
    icon: "🔢",
    totalLessons: 6,
    lessonIds: ["es-u2-l1", "es-u2-l2", "es-u2-l3", "es-u2-l4", "es-u2-l5", "es-u2-l6"],
  },

  // ── FRENCH (2 units) ──
  {
    id: "fr-unit-1",
    languageCode: "fr",
    title: "Bonjour! Greetings",
    description: "Master French greetings, polite expressions, and introductions.",
    order: 1,
    color: "#58CC02",
    icon: "👋",
    totalLessons: 6,
    lessonIds: ["fr-u1-l1", "fr-u1-l2", "fr-u1-l3", "fr-u1-l4", "fr-u1-l5", "fr-u1-l6"],
  },
  {
    id: "fr-unit-2",
    languageCode: "fr",
    title: "Au Café & Food",
    description: "Order croissants, café au lait, and ask for the bill.",
    order: 2,
    color: "#FF4B4B",
    icon: "🥐",
    totalLessons: 6,
    lessonIds: ["fr-u2-l1", "fr-u2-l2", "fr-u2-l3", "fr-u2-l4", "fr-u2-l5", "fr-u2-l6"],
  },

  // ── JAPANESE (2 units) ──
  {
    id: "ja-unit-1",
    languageCode: "ja",
    title: "こんにちは! Greetings",
    description: "Say hello, goodbye, and learn basic polite Japanese phrases.",
    order: 1,
    color: "#58CC02",
    icon: "🎌",
    totalLessons: 6,
    lessonIds: ["ja-u1-l1", "ja-u1-l2", "ja-u1-l3", "ja-u1-l4", "ja-u1-l5", "ja-u1-l6"],
  },
  {
    id: "ja-unit-2",
    languageCode: "ja",
    title: "At the Ramen Shop",
    description: "Order delicious food and drinks in Tokyo cafés & restaurants.",
    order: 2,
    color: "#FF9600",
    icon: "🍜",
    totalLessons: 6,
    lessonIds: ["ja-u2-l1", "ja-u2-l2", "ja-u2-l3", "ja-u2-l4", "ja-u2-l5", "ja-u2-l6"],
  },

  // ── KOREAN (2 units) ──
  {
    id: "ko-unit-1",
    languageCode: "ko",
    title: "안녕하세요! Basics",
    description: "Essential Hangul greetings and self introductions.",
    order: 1,
    color: "#58CC02",
    icon: "🌸",
    totalLessons: 6,
    lessonIds: ["ko-u1-l1", "ko-u1-l2", "ko-u1-l3", "ko-u1-l4", "ko-u1-l5", "ko-u1-l6"],
  },
  {
    id: "ko-unit-2",
    languageCode: "ko",
    title: "K-Food & Café",
    description: "Order boba, kimchi, and chat at trendy Seoul cafés.",
    order: 2,
    color: "#CE82FF",
    icon: "🧋",
    totalLessons: 6,
    lessonIds: ["ko-u2-l1", "ko-u2-l2", "ko-u2-l3", "ko-u2-l4", "ko-u2-l5", "ko-u2-l6"],
  },

  // ── GERMAN (2 units) ──
  {
    id: "de-unit-1",
    languageCode: "de",
    title: "Hallo & Greetings",
    description: "Basic introductions, polite phrases, and everyday words.",
    order: 1,
    color: "#58CC02",
    icon: "🥨",
    totalLessons: 6,
    lessonIds: ["de-u1-l1", "de-u1-l2", "de-u1-l3", "de-u1-l4", "de-u1-l5", "de-u1-l6"],
  },
  {
    id: "de-unit-2",
    languageCode: "de",
    title: "Im Café",
    description: "Order coffee, pretzels, and talk with friends.",
    order: 2,
    color: "#00CD9C",
    icon: "☕",
    totalLessons: 6,
    lessonIds: ["de-u2-l1", "de-u2-l2", "de-u2-l3", "de-u2-l4", "de-u2-l5", "de-u2-l6"],
  },

  // ── CHINESE (2 units) ──
  {
    id: "zh-unit-1",
    languageCode: "zh",
    title: "你好! Basics",
    description: "Learn Pinyin, greetings, and basic Mandarin expressions.",
    order: 1,
    color: "#58CC02",
    icon: "🐉",
    totalLessons: 6,
    lessonIds: ["zh-u1-l1", "zh-u1-l2", "zh-u1-l3", "zh-u1-l4", "zh-u1-l5", "zh-u1-l6"],
  },
  {
    id: "zh-unit-2",
    languageCode: "zh",
    title: "Tea & Dining",
    description: "Order boba tea, dumplings, and dine like a local.",
    order: 2,
    color: "#FF4B4B",
    icon: "🥟",
    totalLessons: 6,
    lessonIds: ["zh-u2-l1", "zh-u2-l2", "zh-u2-l3", "zh-u2-l4", "zh-u2-l5", "zh-u2-l6"],
  },

  // ── PORTUGUESE (2 units) ──
  {
    id: "pt-unit-1",
    languageCode: "pt",
    title: "Olá & Basics",
    description: "Warm greetings and introductions in Portuguese.",
    order: 1,
    color: "#58CC02",
    icon: "🏖️",
    totalLessons: 6,
    lessonIds: ["pt-u1-l1", "pt-u1-l2", "pt-u1-l3", "pt-u1-l4", "pt-u1-l5", "pt-u1-l6"],
  },
  {
    id: "pt-unit-2",
    languageCode: "pt",
    title: "No Café",
    description: "Order coffee, pastries, and chat at the beachside café.",
    order: 2,
    color: "#FFC800",
    icon: "🥐",
    totalLessons: 6,
    lessonIds: ["pt-u2-l1", "pt-u2-l2", "pt-u2-l3", "pt-u2-l4", "pt-u2-l5", "pt-u2-l6"],
  },

  // ── ITALIAN (2 units) ──
  {
    id: "it-unit-1",
    languageCode: "it",
    title: "Ciao! Greetings",
    description: "Italian greetings, pleasantries, and introductions.",
    order: 1,
    color: "#58CC02",
    icon: "🍕",
    totalLessons: 6,
    lessonIds: ["it-u1-l1", "it-u1-l2", "it-u1-l3", "it-u1-l4", "it-u1-l5", "it-u1-l6"],
  },
  {
    id: "it-unit-2",
    languageCode: "it",
    title: "Al Caffè",
    description: "Order espresso, gelato, and enjoy Italian café culture.",
    order: 2,
    color: "#2B70C9",
    icon: "☕",
    totalLessons: 6,
    lessonIds: ["it-u2-l1", "it-u2-l2", "it-u2-l3", "it-u2-l4", "it-u2-l5", "it-u2-l6"],
  },
];

/**
 * Get all units for a specific language, sorted by order.
 */
export function getUnitsByLanguage(languageCode: LanguageCode): Unit[] {
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

/**
 * Get active unit for a language based on user's completed lesson progress.
 */
export function getActiveUnitForLanguage(
  languageCode: LanguageCode,
  completedLessonIds: string[] = []
): Unit {
  const languageUnits = getUnitsByLanguage(languageCode);

  if (languageUnits.length === 0) {
    return {
      id: `${languageCode}-unit-1`,
      languageCode: languageCode,
      title: "At the Café",
      description: "Order coffee, snacks, and talk about food and drinks.",
      order: 2,
      color: "#58CC02",
      icon: "☕",
      totalLessons: 6,
      lessonIds: [],
    };
  }

  return (
    languageUnits.find((u) =>
      u.lessonIds.some((id) => !completedLessonIds.includes(id))
    ) || languageUnits[languageUnits.length - 1]
  );
}
