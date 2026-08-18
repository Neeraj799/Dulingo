import type { Language } from "@/types/learning";

/**
 * All supported languages in the app.
 *
 * isAvailable = false means the language is shown in the UI
 * as "coming soon" and cannot be selected yet.
 */
export const languages: Language[] = [
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "https://flagcdn.com/w80/es.png",
    description: "The world's second most spoken language — vibrant, melodic, and incredibly useful.",
    totalUnits: 5,
    isAvailable: true,
    learnerCount: "28.4M learners",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "https://flagcdn.com/w80/fr.png",
    description: "The language of love, art, and diplomacy — spoken across five continents.",
    totalUnits: 5,
    isAvailable: true,
    learnerCount: "19.4M learners",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "https://flagcdn.com/w80/jp.png",
    description: "A beautifully structured language rich in culture, anime, and technology.",
    totalUnits: 5,
    isAvailable: true,
    learnerCount: "12.7M learners",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "https://flagcdn.com/w80/kr.png",
    description: "K-pop, K-drama, and one of the most logical writing systems ever invented.",
    totalUnits: 5,
    isAvailable: true,
    learnerCount: "9.3M learners",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "https://flagcdn.com/w80/de.png",
    description: "Precise, logical, and powerful — the most spoken native language in Europe.",
    totalUnits: 5,
    isAvailable: true,
    learnerCount: "8.1M learners",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "https://flagcdn.com/w80/cn.png",
    description: "Mandarin Chinese — the most spoken language on Earth, full of history and nuance.",
    totalUnits: 5,
    isAvailable: false,
    learnerCount: "7.4M learners",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "https://flagcdn.com/w80/pt.png",
    description: "Warm, rhythmic, and spoken by 260 million people from Brazil to Portugal.",
    totalUnits: 5,
    isAvailable: false,
    learnerCount: "6.2M learners",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "https://flagcdn.com/w80/it.png",
    description: "The language of opera, pasta, and Renaissance art — musical in every syllable.",
    totalUnits: 5,
    isAvailable: false,
    learnerCount: "4.8M learners",
  },
];

/**
 * Returns a language by its code, or undefined if not found.
 */
export function getLanguageByCode(code: string): Language | undefined {
  return languages.find((l) => l.code === code);
}

/**
 * Returns only the languages that are currently available to learn.
 */
export function getAvailableLanguages(): Language[] {
  return languages.filter((l) => l.isAvailable);
}