// ─────────────────────────────────────────────
// Language
// ─────────────────────────────────────────────

export type LanguageCode =
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "ja" // Japanese
  | "zh" // Chinese (Mandarin)
  | "pt" // Portuguese
  | "it" // Italian
  | "ko"; // Korean

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string; // URL to a remote flag image, e.g. "https://flagcdn.com/w80/es.png"
  description: string;
  totalUnits: number;
  isAvailable: boolean;
  /** Display string for learner count, e.g. "28.4M learners" */
  learnerCount?: string;
}

// ─────────────────────────────────────────────
// Vocabulary
// ─────────────────────────────────────────────

export interface VocabularyItem {
  id: string;
  word: string; // target language word
  translation: string; // English translation
  pronunciation?: string; // romanisation or IPA
  exampleSentence?: string; // target language sentence
  exampleTranslation?: string; // English translation of example
  imageHint?: string; // keyword for image search / generation
}

// ─────────────────────────────────────────────
// Phrase
// ─────────────────────────────────────────────

export interface Phrase {
  id: string;
  phrase: string; // target language phrase
  translation: string; // English translation
  pronunciation?: string;
  context?: string; // e.g. "used when greeting someone for the first time"
}

// ─────────────────────────────────────────────
// Activity
// ─────────────────────────────────────────────

export type ActivityType =
  | "multiple_choice" // pick the correct translation
  | "fill_in_blank" // type the missing word
  | "match_pairs" // drag and match pairs
  | "listen_and_select" // hear audio, pick the right option
  | "translate_sentence" // type a full sentence translation
  | "speak_word"; // speak the word / phrase aloud

export interface MultipleChoiceActivity {
  type: "multiple_choice";
  question: string; // e.g. "What does 'hola' mean?"
  options: string[];
  correctAnswer: string;
  hint?: string;
}

export interface FillInBlankActivity {
  type: "fill_in_blank";
  sentence: string; // sentence with ____ placeholder
  correctAnswer: string;
  hint?: string;
}

export interface MatchPairsActivity {
  type: "match_pairs";
  pairs: Array<{ left: string; right: string }>;
}

export interface ListenAndSelectActivity {
  type: "listen_and_select";
  audioText: string; // text to be synthesised to speech
  options: string[];
  correctAnswer: string;
}

export interface TranslateSentenceActivity {
  type: "translate_sentence";
  prompt: string; // English sentence to translate
  acceptedAnswers: string[]; // one or more valid target-language answers
  hint?: string;
}

export interface SpeakWordActivity {
  type: "speak_word";
  targetWord: string; // word/phrase to read aloud
  translation: string;
}

export type Activity =
  | MultipleChoiceActivity
  | FillInBlankActivity
  | MatchPairsActivity
  | ListenAndSelectActivity
  | TranslateSentenceActivity
  | SpeakWordActivity;

// ─────────────────────────────────────────────
// Lesson
// ─────────────────────────────────────────────

export type LessonType =
  | "vocabulary" // learn new words
  | "phrases" // common phrases & expressions
  | "grammar" // grammar concepts
  | "listening" // audio comprehension
  | "speaking" // pronunciation practice
  | "review"; // mixed review of past content

export interface LessonGoal {
  description: string; // e.g. "Learn 5 common greetings in Spanish"
  xpReward: number;
}

export interface AITeacherPrompt {
  /**
   * System-level prompt sent to the Vision Agent / LLM
   * when this lesson runs in AI teacher mode.
   */
  systemPrompt: string;
  /**
   * Opening message the AI teacher speaks to the student.
   */
  openingMessage: string;
  /**
   * Key topics the AI should cover during the lesson.
   */
  topics: string[];
  /**
   * Example questions the AI should ask the student.
   */
  exampleQuestions: string[];
}

export interface Lesson {
  id: string;
  unitId: string;
  languageCode: LanguageCode;
  title: string;
  description: string;
  type: LessonType;
  order: number; // position within the unit (1-indexed)
  xpReward: number;
  goal: LessonGoal;
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  activities: Activity[];
  aiTeacherPrompt?: AITeacherPrompt;
}

// ─────────────────────────────────────────────
// Unit
// ─────────────────────────────────────────────

export interface Unit {
  id: string;
  languageCode: LanguageCode;
  title: string;
  description: string;
  order: number; // position within the language course (1-indexed)
  color: string; // hex colour used in the UI
  icon: string; // emoji icon shown on the unit card
  totalLessons: number;
  lessonIds: string[];
}

// ─────────────────────────────────────────────
// Progress (used by Zustand store)
// ─────────────────────────────────────────────

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  xpEarned: number;
  completedAt?: string; // ISO date string
  score?: number; // 0-100
}

export interface UnitProgress {
  unitId: string;
  completedLessons: string[]; // lesson IDs
  isUnlocked: boolean;
}

export interface LanguageProgress {
  languageCode: LanguageCode;
  totalXP: number;
  currentStreak: number;
  unitsProgress: UnitProgress[];
  lessonsProgress: LessonProgress[];
}
