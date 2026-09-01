import type { LanguageCode, Lesson, Unit } from "@/types/learning";
import { getLanguageByCode } from "./languages";
import { getUnitById } from "./units";

/**
 * All lessons across all available languages.
 *
 * Each lesson belongs to a unit and contains:
 *  - vocabulary items
 *  - phrases
 *  - activities (interactive exercises)
 *  - an optional AI teacher prompt for Vision Agent lessons
 */
export const lessons: Lesson[] = [
  // ════════════════════════════════════════════
  // SPANISH — Unit 1: Greetings & Basics
  // ════════════════════════════════════════════

  {
    id: "es-u1-l1",
    unitId: "es-unit-1",
    languageCode: "es",
    title: "Hello & Goodbye",
    description: "Learn the most essential greetings in Spanish.",
    type: "vocabulary",
    order: 1,
    xpReward: 10,
    goal: {
      description: "Learn 5 common Spanish greetings",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "es-vocab-hola",
        word: "Hola",
        translation: "Hello",
        pronunciation: "OH-lah",
        exampleSentence: "¡Hola! ¿Cómo estás?",
        exampleTranslation: "Hello! How are you?",
        imageHint: "greeting wave",
      },
      {
        id: "es-vocab-adios",
        word: "Adiós",
        translation: "Goodbye",
        pronunciation: "ah-dee-OHS",
        exampleSentence: "Adiós, hasta mañana.",
        exampleTranslation: "Goodbye, see you tomorrow.",
        imageHint: "waving goodbye",
      },
      {
        id: "es-vocab-buenos-dias",
        word: "Buenos días",
        translation: "Good morning",
        pronunciation: "BWEH-nos DEE-as",
        exampleSentence: "Buenos días, señor.",
        exampleTranslation: "Good morning, sir.",
        imageHint: "sunrise morning",
      },
      {
        id: "es-vocab-buenas-noches",
        word: "Buenas noches",
        translation: "Good night",
        pronunciation: "BWEH-nas NOH-ches",
        exampleSentence: "Buenas noches, que descanses.",
        exampleTranslation: "Good night, rest well.",
        imageHint: "night moon stars",
      },
      {
        id: "es-vocab-hasta-luego",
        word: "Hasta luego",
        translation: "See you later",
        pronunciation: "AH-stah LWEH-go",
        exampleSentence: "Hasta luego, amigo.",
        exampleTranslation: "See you later, friend.",
        imageHint: "friends parting",
      },
    ],
    phrases: [
      {
        id: "es-phrase-como-estas",
        phrase: "¿Cómo estás?",
        translation: "How are you?",
        pronunciation: "KOH-mo eh-STAHS",
        context: "Used informally with friends and peers",
      },
      {
        id: "es-phrase-bien-gracias",
        phrase: "Bien, gracias.",
        translation: "Fine, thank you.",
        pronunciation: "BYEHN, GRAH-syahs",
        context: "Common response to 'How are you?'",
      },
    ],
    activities: [
      {
        type: "multiple_choice",
        question: "What does 'Hola' mean in English?",
        options: ["Goodbye", "Hello", "Thank you", "Good night"],
        correctAnswer: "Hello",
        hint: "This is the most common Spanish greeting.",
      },
      {
        type: "multiple_choice",
        question: "Which phrase means 'Good morning' in Spanish?",
        options: ["Buenas noches", "Hasta luego", "Buenos días", "Adiós"],
        correctAnswer: "Buenos días",
      },
      {
        type: "fill_in_blank",
        sentence: "¡____! ¿Cómo estás?",
        correctAnswer: "Hola",
        hint: "The most common Spanish greeting.",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "Hola", right: "Hello" },
          { left: "Adiós", right: "Goodbye" },
          { left: "Buenos días", right: "Good morning" },
          { left: "Buenas noches", right: "Good night" },
        ],
      },
      {
        type: "translate_sentence",
        prompt: "Goodbye, see you later.",
        acceptedAnswers: ["Adiós, hasta luego.", "Adiós, hasta luego"],
        hint: "Use 'adiós' for goodbye and 'hasta luego' for see you later.",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Luna, a friendly and enthusiastic Spanish teacher for beginners. Speak clearly, use simple English explanations, and always encourage the student. Teach Spanish greetings step by step. Pronounce each word slowly and clearly. Ask the student to repeat after you. Celebrate every correct answer with warmth.",
      openingMessage:
        "¡Hola! I'm Luna, your Spanish teacher! Today we're going to learn how to greet people in Spanish. It's super easy and so much fun! Ready? Let's start! 🌟",
      topics: [
        "How to say hello and goodbye in Spanish",
        "Morning, afternoon, and evening greetings",
        "Asking 'How are you?' and responding",
        "Pronunciation tips for common greetings",
      ],
      exampleQuestions: [
        "Can you repeat after me: Hola!",
        "How would you say 'Good morning' in Spanish?",
        "What's the difference between 'Adiós' and 'Hasta luego'?",
        "Try saying: Buenos días! How did that feel?",
      ],
    },
  },

  {
    id: "es-u1-l2",
    unitId: "es-unit-1",
    languageCode: "es",
    title: "Introducing Yourself",
    description: "Learn how to say your name and ask others for theirs.",
    type: "phrases",
    order: 2,
    xpReward: 10,
    goal: {
      description: "Learn to introduce yourself in Spanish",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "es-vocab-me-llamo",
        word: "Me llamo",
        translation: "My name is",
        pronunciation: "meh YAH-mo",
        exampleSentence: "Me llamo Carlos.",
        exampleTranslation: "My name is Carlos.",
      },
      {
        id: "es-vocab-soy",
        word: "Soy",
        translation: "I am",
        pronunciation: "SOY",
        exampleSentence: "Soy estudiante.",
        exampleTranslation: "I am a student.",
      },
      {
        id: "es-vocab-tu-nombre",
        word: "Tu nombre",
        translation: "Your name",
        pronunciation: "too NOHM-breh",
        exampleSentence: "¿Cuál es tu nombre?",
        exampleTranslation: "What is your name?",
      },
    ],
    phrases: [
      {
        id: "es-phrase-como-te-llamas",
        phrase: "¿Cómo te llamas?",
        translation: "What is your name?",
        pronunciation: "KOH-mo teh YAH-mas",
        context: "Used informally to ask someone's name",
      },
      {
        id: "es-phrase-mucho-gusto",
        phrase: "Mucho gusto.",
        translation: "Nice to meet you.",
        pronunciation: "MOO-cho GOO-sto",
        context: "Said after being introduced to someone",
      },
      {
        id: "es-phrase-de-donde-eres",
        phrase: "¿De dónde eres?",
        translation: "Where are you from?",
        pronunciation: "deh DOHN-deh EH-res",
        context: "Casual way to ask someone's origin",
      },
    ],
    activities: [
      {
        type: "multiple_choice",
        question: "How do you say 'My name is' in Spanish?",
        options: ["Soy", "Me llamo", "Tu nombre", "Mucho gusto"],
        correctAnswer: "Me llamo",
      },
      {
        type: "fill_in_blank",
        sentence: "¿Cómo te ____?",
        correctAnswer: "llamas",
        hint: "Complete the phrase for asking someone's name.",
      },
      {
        type: "translate_sentence",
        prompt: "Nice to meet you.",
        acceptedAnswers: ["Mucho gusto.", "Mucho gusto"],
        hint: "Think of the phrase you say right after meeting someone new.",
      },
      {
        type: "speak_word",
        targetWord: "Me llamo",
        translation: "My name is",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Luna, a friendly Spanish teacher. Today's lesson is about introducing yourself. Help the student practice saying their name, asking others' names, and polite introductions. Keep it conversational, fun, and beginner-friendly.",
      openingMessage:
        "¡Hola de nuevo! Today we're learning how to introduce ourselves in Spanish. This is one of the most important skills — you'll use it every time you meet someone new. Let's practice! 😊",
      topics: [
        "Saying your name with 'Me llamo'",
        "Asking someone's name with '¿Cómo te llamas?'",
        "Saying 'Nice to meet you' — Mucho gusto",
        "Asking where someone is from",
      ],
      exampleQuestions: [
        "Try saying your name in Spanish: Me llamo ___",
        "How would you ask someone's name?",
        "What do you say when you first meet someone?",
        "Can you introduce yourself fully in one sentence?",
      ],
    },
  },

  {
    id: "es-u1-l3",
    unitId: "es-unit-1",
    languageCode: "es",
    title: "Polite Expressions",
    description: "Learn please, thank you, sorry, and excuse me.",
    type: "phrases",
    order: 3,
    xpReward: 10,
    goal: {
      description: "Master 5 essential polite expressions in Spanish",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "es-vocab-gracias",
        word: "Gracias",
        translation: "Thank you",
        pronunciation: "GRAH-syahs",
        exampleSentence: "Muchas gracias por tu ayuda.",
        exampleTranslation: "Thank you very much for your help.",
      },
      {
        id: "es-vocab-por-favor",
        word: "Por favor",
        translation: "Please",
        pronunciation: "por fa-VOR",
        exampleSentence: "Un café, por favor.",
        exampleTranslation: "A coffee, please.",
      },
      {
        id: "es-vocab-de-nada",
        word: "De nada",
        translation: "You're welcome",
        pronunciation: "deh NAH-dah",
        exampleSentence: "— Gracias. — De nada.",
        exampleTranslation: "— Thank you. — You're welcome.",
      },
      {
        id: "es-vocab-perdon",
        word: "Perdón",
        translation: "Sorry / Excuse me",
        pronunciation: "pehr-DOHN",
        exampleSentence: "Perdón, no entiendo.",
        exampleTranslation: "Sorry, I don't understand.",
      },
      {
        id: "es-vocab-lo-siento",
        word: "Lo siento",
        translation: "I'm sorry",
        pronunciation: "lo SYEHN-to",
        exampleSentence: "Lo siento mucho.",
        exampleTranslation: "I'm very sorry.",
      },
    ],
    phrases: [],
    activities: [
      {
        type: "multiple_choice",
        question: "What does 'Por favor' mean?",
        options: ["Thank you", "Sorry", "Please", "You're welcome"],
        correctAnswer: "Please",
      },
      {
        type: "multiple_choice",
        question: "How do you say 'You're welcome' in Spanish?",
        options: ["Gracias", "Perdón", "Lo siento", "De nada"],
        correctAnswer: "De nada",
      },
      {
        type: "fill_in_blank",
        sentence: "Un café, por ____.",
        correctAnswer: "favor",
        hint: "Complete the polite request.",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "Gracias", right: "Thank you" },
          { left: "Por favor", right: "Please" },
          { left: "De nada", right: "You're welcome" },
          { left: "Lo siento", right: "I'm sorry" },
        ],
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Luna, a warm and encouraging Spanish teacher. Today's focus is on polite expressions — gracias, por favor, perdón, and more. Make the student feel confident using these in everyday situations. Use role-play scenarios to make it fun.",
      openingMessage:
        "¡Hola! Being polite in Spanish is really important and also super easy. Today I'll teach you words like 'thank you', 'please', and 'sorry'. These will help you everywhere. Let's go! 🌺",
      topics: [
        "Saying thank you — Gracias",
        "Saying please — Por favor",
        "Saying you're welcome — De nada",
        "Apologising with Perdón and Lo siento",
      ],
      exampleQuestions: [
        "How would you ask for a glass of water politely?",
        "Someone helped you — what do you say?",
        "You bumped into someone — what's the polite thing to say?",
        "What's the difference between 'Perdón' and 'Lo siento'?",
      ],
    },
  },

  // ════════════════════════════════════════════
  // SPANISH — Unit 2: Numbers & Colors
  // ════════════════════════════════════════════

  {
    id: "es-u2-l1",
    unitId: "es-unit-2",
    languageCode: "es",
    title: "Numbers 1–10",
    description: "Count from one to ten in Spanish.",
    type: "vocabulary",
    order: 1,
    xpReward: 10,
    goal: {
      description: "Learn numbers 1 through 10 in Spanish",
      xpReward: 10,
    },
    vocabulary: [
      { id: "es-num-1", word: "uno", translation: "one", pronunciation: "OO-no" },
      { id: "es-num-2", word: "dos", translation: "two", pronunciation: "DOHS" },
      { id: "es-num-3", word: "tres", translation: "three", pronunciation: "TREHS" },
      { id: "es-num-4", word: "cuatro", translation: "four", pronunciation: "KWAH-tro" },
      { id: "es-num-5", word: "cinco", translation: "five", pronunciation: "SEEN-ko" },
      { id: "es-num-6", word: "seis", translation: "six", pronunciation: "SAYS" },
      { id: "es-num-7", word: "siete", translation: "seven", pronunciation: "SYEH-teh" },
      { id: "es-num-8", word: "ocho", translation: "eight", pronunciation: "OH-cho" },
      { id: "es-num-9", word: "nueve", translation: "nine", pronunciation: "NWEH-veh" },
      { id: "es-num-10", word: "diez", translation: "ten", pronunciation: "DYEHS" },
    ],
    phrases: [],
    activities: [
      {
        type: "multiple_choice",
        question: "What is 'cinco' in English?",
        options: ["three", "six", "five", "four"],
        correctAnswer: "five",
      },
      {
        type: "multiple_choice",
        question: "How do you say 'eight' in Spanish?",
        options: ["siete", "nueve", "seis", "ocho"],
        correctAnswer: "ocho",
      },
      {
        type: "fill_in_blank",
        sentence: "uno, dos, ____, cuatro, cinco",
        correctAnswer: "tres",
        hint: "What comes after 'dos'?",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "uno", right: "one" },
          { left: "tres", right: "three" },
          { left: "siete", right: "seven" },
          { left: "diez", right: "ten" },
        ],
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Luna, an enthusiastic Spanish teacher. Today you are teaching numbers 1 to 10. Make counting feel fun and memorable by using rhythm, repetition, and simple games. Ask the student to count out loud after you.",
      openingMessage:
        "¡Hola! Numbers are one of the first things you need in any language. Today we'll count from uno to diez — one to ten! It's easier than you think. Follow my lead! 🔢",
      topics: [
        "Counting from 1 to 10 in Spanish",
        "Pronunciation of each number",
        "Using numbers in simple sentences",
      ],
      exampleQuestions: [
        "Count to 5 with me: uno, dos...",
        "How do you say the number 7 in Spanish?",
        "What comes after 'ocho'?",
        "Try counting from 1 to 10 on your own!",
      ],
    },
  },

  {
    id: "es-u2-l2",
    unitId: "es-unit-2",
    languageCode: "es",
    title: "Numbers 11–20",
    description: "Continue counting from eleven to twenty.",
    type: "vocabulary",
    order: 2,
    xpReward: 10,
    goal: {
      description: "Learn numbers 11 through 20 in Spanish",
      xpReward: 10,
    },
    vocabulary: [
      { id: "es-num-11", word: "once", translation: "eleven", pronunciation: "OHN-seh" },
      { id: "es-num-12", word: "doce", translation: "twelve", pronunciation: "DOH-seh" },
      { id: "es-num-13", word: "trece", translation: "thirteen", pronunciation: "TREH-seh" },
      { id: "es-num-14", word: "catorce", translation: "fourteen", pronunciation: "kah-TOR-seh" },
      { id: "es-num-15", word: "quince", translation: "fifteen", pronunciation: "KEEN-seh" },
      { id: "es-num-16", word: "dieciséis", translation: "sixteen", pronunciation: "dyeh-see-SAYS" },
      { id: "es-num-17", word: "diecisiete", translation: "seventeen", pronunciation: "dyeh-see-SYEH-teh" },
      { id: "es-num-18", word: "dieciocho", translation: "eighteen", pronunciation: "dyeh-see-OH-cho" },
      { id: "es-num-19", word: "diecinueve", translation: "nineteen", pronunciation: "dyeh-see-NWEH-veh" },
      { id: "es-num-20", word: "veinte", translation: "twenty", pronunciation: "VAYN-teh" },
    ],
    phrases: [],
    activities: [
      {
        type: "multiple_choice",
        question: "What does 'quince' mean?",
        options: ["twelve", "fifteen", "thirteen", "sixteen"],
        correctAnswer: "fifteen",
      },
      {
        type: "fill_in_blank",
        sentence: "quince, dieciséis, ____, dieciocho",
        correctAnswer: "diecisiete",
        hint: "What comes between sixteen and eighteen?",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Luna, a Spanish teacher. Continue teaching numbers, now from 11 to 20. Emphasise the pattern in 16–19 (diecis + number). Keep it light and fun.",
      openingMessage:
        "¡Muy bien! You know 1 to 10 — now let's go further! Numbers 11 to 20 have some interesting patterns. Let's explore them together! 🚀",
      topics: [
        "Numbers 11–15 individually",
        "The 'diecis-' pattern for 16–19",
        "Twenty — veinte",
      ],
      exampleQuestions: [
        "How do you say 'fifteen' in Spanish?",
        "What pattern do you notice in 16, 17, 18, and 19?",
        "Count from 11 to 20 with me!",
      ],
    },
  },

  {
    id: "es-u2-l3",
    unitId: "es-unit-2",
    languageCode: "es",
    title: "Colors",
    description: "Name common colors in Spanish.",
    type: "vocabulary",
    order: 3,
    xpReward: 10,
    goal: {
      description: "Learn 8 common colors in Spanish",
      xpReward: 10,
    },
    vocabulary: [
      { id: "es-color-rojo", word: "rojo", translation: "red", pronunciation: "ROH-ho", imageHint: "red color swatch" },
      { id: "es-color-azul", word: "azul", translation: "blue", pronunciation: "ah-SOOL", imageHint: "blue color swatch" },
      { id: "es-color-verde", word: "verde", translation: "green", pronunciation: "BEHR-deh", imageHint: "green color swatch" },
      { id: "es-color-amarillo", word: "amarillo", translation: "yellow", pronunciation: "ah-mah-REE-yo", imageHint: "yellow color swatch" },
      { id: "es-color-blanco", word: "blanco", translation: "white", pronunciation: "BLAHN-ko", imageHint: "white color swatch" },
      { id: "es-color-negro", word: "negro", translation: "black", pronunciation: "NEH-gro", imageHint: "black color swatch" },
      { id: "es-color-naranja", word: "naranja", translation: "orange", pronunciation: "nah-RAHN-hah", imageHint: "orange color swatch" },
      { id: "es-color-morado", word: "morado", translation: "purple", pronunciation: "mo-RAH-do", imageHint: "purple color swatch" },
    ],
    phrases: [
      {
        id: "es-phrase-de-que-color",
        phrase: "¿De qué color es?",
        translation: "What color is it?",
        pronunciation: "deh keh ko-LOR ehs",
        context: "Used to ask about the color of something",
      },
    ],
    activities: [
      {
        type: "multiple_choice",
        question: "What color is 'azul'?",
        options: ["red", "green", "blue", "yellow"],
        correctAnswer: "blue",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "rojo", right: "red" },
          { left: "verde", right: "green" },
          { left: "amarillo", right: "yellow" },
          { left: "blanco", right: "white" },
        ],
      },
      {
        type: "translate_sentence",
        prompt: "The sky is blue.",
        acceptedAnswers: ["El cielo es azul.", "El cielo es azul"],
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Luna, a fun Spanish teacher. Teach colors by asking the student to look around and describe objects by color. Use real-world examples to make it memorable.",
      openingMessage:
        "¡Hola! Look around you — everything has a color! Today we'll learn how to describe colors in Spanish. It's super useful and really fun. Ready? 🌈",
      topics: [
        "Eight common Spanish colors",
        "How to describe objects using colors",
        "Asking 'What color is it?' — ¿De qué color es?",
      ],
      exampleQuestions: [
        "What color is the sky? Can you say it in Spanish?",
        "How do you say 'red' in Spanish?",
        "Look at something around you — what color is it in Spanish?",
      ],
    },
  },

  // ════════════════════════════════════════════
  // FRENCH — Unit 1: Greetings
  // ════════════════════════════════════════════

  {
    id: "fr-u1-l1",
    unitId: "fr-unit-1",
    languageCode: "fr",
    title: "Bonjour! Hello & Goodbye",
    description: "Learn the most essential French greetings.",
    type: "vocabulary",
    order: 1,
    xpReward: 10,
    goal: {
      description: "Learn 5 common French greetings",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "fr-vocab-bonjour",
        word: "Bonjour",
        translation: "Hello / Good morning",
        pronunciation: "bon-ZHOOR",
        exampleSentence: "Bonjour, comment ça va?",
        exampleTranslation: "Hello, how are you?",
      },
      {
        id: "fr-vocab-bonsoir",
        word: "Bonsoir",
        translation: "Good evening",
        pronunciation: "bon-SWAHR",
        exampleSentence: "Bonsoir, madame.",
        exampleTranslation: "Good evening, ma'am.",
      },
      {
        id: "fr-vocab-au-revoir",
        word: "Au revoir",
        translation: "Goodbye",
        pronunciation: "oh ruh-VWAHR",
        exampleSentence: "Au revoir, à bientôt!",
        exampleTranslation: "Goodbye, see you soon!",
      },
      {
        id: "fr-vocab-salut",
        word: "Salut",
        translation: "Hi / Bye (informal)",
        pronunciation: "sah-LUE",
        exampleSentence: "Salut, ça va?",
        exampleTranslation: "Hi, how's it going?",
      },
      {
        id: "fr-vocab-bonne-nuit",
        word: "Bonne nuit",
        translation: "Good night",
        pronunciation: "bun NWEE",
        exampleSentence: "Bonne nuit, dors bien.",
        exampleTranslation: "Good night, sleep well.",
      },
    ],
    phrases: [
      {
        id: "fr-phrase-ca-va",
        phrase: "Comment ça va?",
        translation: "How are you?",
        pronunciation: "koh-MON sah VAH",
        context: "Informal — used with friends",
      },
      {
        id: "fr-phrase-ca-va-bien",
        phrase: "Ça va bien, merci.",
        translation: "I'm doing well, thank you.",
        pronunciation: "sah VAH byaN, mehr-SEE",
      },
    ],
    activities: [
      {
        type: "multiple_choice",
        question: "What does 'Bonjour' mean?",
        options: ["Good night", "Goodbye", "Hello / Good morning", "Good evening"],
        correctAnswer: "Hello / Good morning",
      },
      {
        type: "fill_in_blank",
        sentence: "Au ____, à bientôt!",
        correctAnswer: "revoir",
        hint: "Complete the French goodbye phrase.",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "Bonjour", right: "Hello" },
          { left: "Bonsoir", right: "Good evening" },
          { left: "Au revoir", right: "Goodbye" },
          { left: "Bonne nuit", right: "Good night" },
        ],
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Claire, a warm and patient French teacher for beginners. You speak in a calm, encouraging voice. Today's lesson is French greetings. Teach the student how to say hello and goodbye naturally, with proper pronunciation.",
      openingMessage:
        "Bonjour! I'm Claire, your French teacher! French greetings are elegant and easy to learn. By the end of today, you'll be able to greet anyone in French with confidence. Allons-y! (Let's go!) ✨",
      topics: [
        "Bonjour vs Salut — formal vs informal",
        "Evening greetings — Bonsoir",
        "Saying goodbye — Au revoir",
        "Asking how someone is — Comment ça va?",
      ],
      exampleQuestions: [
        "When would you use 'Bonjour' vs 'Salut'?",
        "How do you say 'Good night' in French?",
        "Try greeting me as if we just met formally.",
        "Repeat after me: Au revoir!",
      ],
    },
  },

  {
    id: "fr-u1-l2",
    unitId: "fr-unit-1",
    languageCode: "fr",
    title: "Introducing Yourself",
    description: "Say your name and ask others in French.",
    type: "phrases",
    order: 2,
    xpReward: 10,
    goal: {
      description: "Introduce yourself confidently in French",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "fr-vocab-je-m-appelle",
        word: "Je m'appelle",
        translation: "My name is",
        pronunciation: "zhuh mah-PEL",
        exampleSentence: "Je m'appelle Marie.",
        exampleTranslation: "My name is Marie.",
      },
      {
        id: "fr-vocab-je-suis",
        word: "Je suis",
        translation: "I am",
        pronunciation: "zhuh SWEE",
        exampleSentence: "Je suis étudiant.",
        exampleTranslation: "I am a student.",
      },
    ],
    phrases: [
      {
        id: "fr-phrase-comment-t-appelles-tu",
        phrase: "Comment t'appelles-tu?",
        translation: "What is your name?",
        pronunciation: "koh-MON tah-PEL-too",
        context: "Informal question to ask someone's name",
      },
      {
        id: "fr-phrase-enchante",
        phrase: "Enchanté(e).",
        translation: "Nice to meet you.",
        pronunciation: "on-shon-TAY",
        context: "Used when meeting someone for the first time",
      },
    ],
    activities: [
      {
        type: "multiple_choice",
        question: "How do you say 'My name is' in French?",
        options: ["Je suis", "Je m'appelle", "Enchanté", "Comment t'appelles-tu"],
        correctAnswer: "Je m'appelle",
      },
      {
        type: "translate_sentence",
        prompt: "Nice to meet you.",
        acceptedAnswers: ["Enchanté.", "Enchantée.", "Enchanté", "Enchantée"],
        hint: "The word sounds like 'enchanted' in English.",
      },
      {
        type: "speak_word",
        targetWord: "Je m'appelle",
        translation: "My name is",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Claire, a French teacher. Help the student practice introducing themselves in French. Encourage them to use 'Je m'appelle' and 'Enchanté'. Role-play a first meeting scenario.",
      openingMessage:
        "Bonjour à nouveau! Now let's learn how to introduce ourselves. This is something you'll use every single day in France. It's simple, I promise! 🗼",
      topics: [
        "Saying your name — Je m'appelle",
        "Asking someone's name — Comment t'appelles-tu?",
        "Nice to meet you — Enchanté(e)",
        "I am — Je suis",
      ],
      exampleQuestions: [
        "Can you introduce yourself in French?",
        "How would you ask someone's name informally?",
        "Say: Je m'appelle [your name]. Enchanté!",
      ],
    },
  },

  {
    id: "fr-u1-l3",
    unitId: "fr-unit-1",
    languageCode: "fr",
    title: "Polite Expressions",
    description: "Learn merci, s'il vous plaît, and other essential polite phrases.",
    type: "phrases",
    order: 3,
    xpReward: 10,
    goal: {
      description: "Learn 5 polite French expressions",
      xpReward: 10,
    },
    vocabulary: [
      { id: "fr-vocab-merci", word: "Merci", translation: "Thank you", pronunciation: "mehr-SEE" },
      { id: "fr-vocab-svp", word: "S'il vous plaît", translation: "Please (formal)", pronunciation: "seel voo PLAY" },
      { id: "fr-vocab-stp", word: "S'il te plaît", translation: "Please (informal)", pronunciation: "seel tuh PLAY" },
      { id: "fr-vocab-de-rien", word: "De rien", translation: "You're welcome", pronunciation: "duh RYAN" },
      { id: "fr-vocab-pardon", word: "Pardon", translation: "Sorry / Excuse me", pronunciation: "par-DOHN" },
      { id: "fr-vocab-excusez-moi", word: "Excusez-moi", translation: "Excuse me (formal)", pronunciation: "ex-kue-zay MWAH" },
    ],
    phrases: [],
    activities: [
      {
        type: "multiple_choice",
        question: "What does 'Merci' mean?",
        options: ["Please", "Sorry", "Thank you", "You're welcome"],
        correctAnswer: "Thank you",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "Merci", right: "Thank you" },
          { left: "S'il vous plaît", right: "Please" },
          { left: "De rien", right: "You're welcome" },
          { left: "Pardon", right: "Sorry" },
        ],
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Claire, a French teacher teaching polite expressions. Help the student understand the difference between formal (vous) and informal (tu) forms. Use real-world scenarios like being in a café or on the street.",
      openingMessage:
        "Bonjour! The French love politeness — and today we're going to learn the magic words that will make everyone smile. Merci, s'il vous plaît, and more! 🌸",
      topics: [
        "Thank you — Merci",
        "Please — S'il vous plaît vs S'il te plaît",
        "You're welcome — De rien",
        "Excuse me / Sorry — Pardon, Excusez-moi",
      ],
      exampleQuestions: [
        "How would you politely ask for help in a French shop?",
        "When do you use 'S'il vous plaît' vs 'S'il te plaît'?",
        "Someone holds the door for you — what do you say?",
      ],
    },
  },

  // ════════════════════════════════════════════
  // JAPANESE — Unit 1: Greetings
  // ════════════════════════════════════════════

  {
    id: "ja-u1-l1",
    unitId: "ja-unit-1",
    languageCode: "ja",
    title: "こんにちは! Basic Greetings",
    description: "Learn essential Japanese greetings for morning, day, and night.",
    type: "vocabulary",
    order: 1,
    xpReward: 10,
    goal: {
      description: "Learn 5 essential Japanese greetings",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "ja-vocab-konnichiwa",
        word: "こんにちは",
        translation: "Hello / Good afternoon",
        pronunciation: "kon-ni-chi-wa",
        exampleSentence: "こんにちは！お元気ですか？",
        exampleTranslation: "Hello! How are you?",
      },
      {
        id: "ja-vocab-ohayou",
        word: "おはようございます",
        translation: "Good morning (formal)",
        pronunciation: "o-ha-yoh go-zai-mas",
        exampleSentence: "おはようございます、先生。",
        exampleTranslation: "Good morning, teacher.",
      },
      {
        id: "ja-vocab-konbanwa",
        word: "こんばんは",
        translation: "Good evening",
        pronunciation: "kon-ban-wa",
        exampleSentence: "こんばんは、今日はどうでしたか？",
        exampleTranslation: "Good evening, how was your day?",
      },
      {
        id: "ja-vocab-oyasumi",
        word: "おやすみなさい",
        translation: "Good night",
        pronunciation: "o-ya-su-mi na-sai",
        exampleSentence: "おやすみなさい、いい夢を。",
        exampleTranslation: "Good night, sweet dreams.",
      },
      {
        id: "ja-vocab-sayonara",
        word: "さようなら",
        translation: "Goodbye (formal)",
        pronunciation: "sa-yo-na-ra",
        exampleSentence: "さようなら、また明日。",
        exampleTranslation: "Goodbye, see you tomorrow.",
      },
    ],
    phrases: [
      {
        id: "ja-phrase-ogenki",
        phrase: "お元気ですか？",
        translation: "How are you? (formal)",
        pronunciation: "o-gen-ki des-ka",
        context: "Formal way to ask about someone's wellbeing",
      },
      {
        id: "ja-phrase-genki",
        phrase: "元気です。",
        translation: "I'm fine.",
        pronunciation: "gen-ki des",
      },
    ],
    activities: [
      {
        type: "multiple_choice",
        question: "What does 'こんにちは' mean?",
        options: ["Good night", "Goodbye", "Hello / Good afternoon", "Good morning"],
        correctAnswer: "Hello / Good afternoon",
      },
      {
        type: "multiple_choice",
        question: "Which greeting do you use in the morning?",
        options: ["こんばんは", "おやすみなさい", "さようなら", "おはようございます"],
        correctAnswer: "おはようございます",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "こんにちは", right: "Hello" },
          { left: "こんばんは", right: "Good evening" },
          { left: "おやすみなさい", right: "Good night" },
          { left: "さようなら", right: "Goodbye" },
        ],
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Yuki, a kind and patient Japanese teacher for beginners. Speak clearly and slowly. Today's lesson is Japanese greetings. Use simple romanisation (romaji) to help students pronounce the words. Explain the cultural context of bowing when greeting.",
      openingMessage:
        "こんにちは! I'm Yuki, your Japanese teacher! Japanese greetings are beautiful, and once you know them, you'll feel right at home in Japan. Let's start together! 🌸",
      topics: [
        "Hello — こんにちは (konnichiwa)",
        "Good morning — おはようございます",
        "Good evening — こんばんは",
        "Good night — おやすみなさい",
        "Goodbye — さようなら",
        "The culture of bowing when greeting",
      ],
      exampleQuestions: [
        "How do you say 'Good morning' in Japanese?",
        "When would you use さようなら vs またね (casual goodbye)?",
        "Repeat after me: こんにちは!",
        "What time of day would you say こんばんは?",
      ],
    },
  },

  {
    id: "ja-u1-l2",
    unitId: "ja-unit-1",
    languageCode: "ja",
    title: "Introducing Yourself",
    description: "Say your name and learn basic self-introductions in Japanese.",
    type: "phrases",
    order: 2,
    xpReward: 10,
    goal: {
      description: "Introduce yourself in Japanese",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "ja-vocab-watashi-wa",
        word: "わたしは",
        translation: "I am / My name is (lit. As for me)",
        pronunciation: "wa-ta-shi wa",
        exampleSentence: "わたしはアレックスです。",
        exampleTranslation: "I am Alex.",
      },
      {
        id: "ja-vocab-namae",
        word: "なまえ",
        translation: "Name",
        pronunciation: "na-ma-e",
        exampleSentence: "あなたのなまえは？",
        exampleTranslation: "What is your name?",
      },
      {
        id: "ja-vocab-desu",
        word: "です",
        translation: "Is / Am (polite)",
        pronunciation: "des",
        exampleSentence: "これはほんです。",
        exampleTranslation: "This is a book.",
      },
    ],
    phrases: [
      {
        id: "ja-phrase-hajimemashite",
        phrase: "はじめまして。",
        translation: "Nice to meet you (first meeting).",
        pronunciation: "ha-ji-me-ma-shi-te",
        context: "Always said when meeting someone for the first time in Japanese",
      },
      {
        id: "ja-phrase-yoroshiku",
        phrase: "よろしくおねがいします。",
        translation: "Please treat me well / Nice to meet you.",
        pronunciation: "yo-ro-shi-ku o-ne-gai-shi-mas",
        context: "Said after introducing yourself — very important in Japanese culture",
      },
    ],
    activities: [
      {
        type: "multiple_choice",
        question: "What phrase do you say when meeting someone for the first time?",
        options: ["さようなら", "おやすみなさい", "はじめまして", "おはようございます"],
        correctAnswer: "はじめまして",
      },
      {
        type: "fill_in_blank",
        sentence: "わたしはサラ____。",
        correctAnswer: "です",
        hint: "Complete with the polite 'to be' verb.",
      },
      {
        type: "speak_word",
        targetWord: "はじめまして",
        translation: "Nice to meet you",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Yuki, a Japanese teacher. Today's topic is self-introduction (自己紹介, jikoshoukai). Help the student construct a simple Japanese self-introduction and understand the cultural importance of はじめまして and よろしく.",
      openingMessage:
        "こんにちは! Today we'll learn one of the most important skills in Japanese — introducing yourself! Japanese people have a beautiful ritual for first meetings. I'll show you exactly what to say. 🎋",
      topics: [
        "Saying your name — わたしは___です",
        "はじめまして — the essential first-meeting phrase",
        "よろしくおねがいします — please be kind to me",
        "Why introductions matter so much in Japanese culture",
      ],
      exampleQuestions: [
        "Try introducing yourself fully: はじめまして。わたしは___です。よろしくおねがいします。",
        "What does よろしくおねがいします mean and why is it important?",
        "How is a Japanese introduction different from an English one?",
      ],
    },
  },

  {
    id: "ja-u1-l3",
    unitId: "ja-unit-1",
    languageCode: "ja",
    title: "Polite Expressions",
    description: "Learn ありがとう, すみません, and other polite Japanese words.",
    type: "phrases",
    order: 3,
    xpReward: 10,
    goal: {
      description: "Learn 5 essential polite Japanese expressions",
      xpReward: 10,
    },
    vocabulary: [
      {
        id: "ja-vocab-arigatou",
        word: "ありがとうございます",
        translation: "Thank you very much",
        pronunciation: "a-ri-ga-toh go-zai-mas",
        exampleSentence: "ありがとうございます、先生。",
        exampleTranslation: "Thank you very much, teacher.",
      },
      {
        id: "ja-vocab-sumimasen",
        word: "すみません",
        translation: "Excuse me / I'm sorry",
        pronunciation: "su-mi-ma-sen",
        exampleSentence: "すみません、トイレはどこですか？",
        exampleTranslation: "Excuse me, where is the bathroom?",
      },
      {
        id: "ja-vocab-douzo",
        word: "どうぞ",
        translation: "Please / Go ahead / Here you are",
        pronunciation: "doh-zo",
        exampleSentence: "どうぞ、おすわりください。",
        exampleTranslation: "Please, have a seat.",
      },
      {
        id: "ja-vocab-gomen",
        word: "ごめんなさい",
        translation: "I'm sorry (apology)",
        pronunciation: "go-men-na-sai",
        exampleSentence: "ごめんなさい、おくれました。",
        exampleTranslation: "I'm sorry, I was late.",
      },
    ],
    phrases: [],
    activities: [
      {
        type: "multiple_choice",
        question: "Which word means 'Excuse me' in Japanese?",
        options: ["ありがとう", "どうぞ", "すみません", "ごめんなさい"],
        correctAnswer: "すみません",
      },
      {
        type: "match_pairs",
        pairs: [
          { left: "ありがとう", right: "Thank you" },
          { left: "すみません", right: "Excuse me" },
          { left: "どうぞ", right: "Please / Go ahead" },
          { left: "ごめんなさい", right: "I'm sorry" },
        ],
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Yuki, a Japanese teacher. Teach polite expressions and explain when to use them. Japanese politeness has many levels — keep it simple and focus on everyday situations.",
      openingMessage:
        "こんにちは! Politeness is at the heart of Japanese culture, and today we'll learn the words that show you respect and care. These are words you'll use every day. Let's go! 🌺",
      topics: [
        "Thank you — ありがとうございます",
        "Excuse me / Sorry — すみません",
        "Go ahead / Here you are — どうぞ",
        "Apologising — ごめんなさい",
        "When to bow and how deeply",
      ],
      exampleQuestions: [
        "What's the difference between すみません and ごめんなさい?",
        "Someone gives you a gift — what do you say?",
        "You want to get someone's attention on the street — what do you say?",
        "Repeat after me: ありがとうございます!",
      ],
    },
  },
];

// Default lesson templates for matching 06-lesson-screen.png titles
const DEFAULT_LESSON_TITLES = [
  "Greetings & Introductions",
  "Daily Life",
  "At the Café",
  "Travel & Directions",
  "Shopping",
  "Family & Friends",
];

function generateFallbackLesson(
  lessonId: string,
  unitId: string,
  order: number,
  unitContext?: Unit
): Lesson {
  const unit = unitContext ?? getUnitById(unitId);
  const rawCode = unitId.split("-")[0] || "";
  const langCode: LanguageCode = unit?.languageCode ?? getLanguageByCode(rawCode)?.code ?? "es";
  const title = DEFAULT_LESSON_TITLES[(order - 1) % DEFAULT_LESSON_TITLES.length] || `Lesson ${order}`;

  return {
    id: lessonId,
    unitId,
    languageCode: langCode,
    title,
    description: `Master ${title.toLowerCase()} in your target language with interactive exercises.`,
    type: order % 2 === 0 ? "phrases" : "vocabulary",
    order,
    xpReward: 0,
    goal: {
      description: `Complete ${title} practice exercises`,
      xpReward: 0,
    },
    vocabulary: [
      {
        id: `${lessonId}-vocab-1`,
        word: "Practice Word",
        translation: "Translation",
        pronunciation: "pronunciation",
        exampleSentence: "Example practice sentence.",
        exampleTranslation: "English translation of example sentence.",
        imageHint: "practice lesson item",
      },
    ],
    phrases: [
      {
        id: `${lessonId}-phrase-1`,
        phrase: "Common Expression",
        translation: "Common Expression Translation",
        context: "Used in everyday conversations",
      },
    ],
    activities: [],
  };
}

/**
 * Get all lessons for a specific unit.
 */
export function getLessonsByUnit(unitId: string): Lesson[] {
  const existing = lessons
    .filter((l) => l.unitId === unitId)
    .sort((a, b) => a.order - b.order);

  if (existing.length >= 6) {
    return existing;
  }

  const unit = getUnitById(unitId);
  const prefix = unit?.lessonIds?.[0]?.replace(/\d+$/, "") ?? `${unitId}-l`;

  // Ensure 6 lessons per unit matching design titles
  const result: Lesson[] = [...existing];
  for (let i = 1; i <= 6; i++) {
    const expectedId = unit?.lessonIds?.[i - 1] ?? `${prefix}${i}`;
    if (!result.some((l) => l.id === expectedId || l.order === i)) {
      result.push(generateFallbackLesson(expectedId, unitId, i, unit));
    }
  }

  return result.sort((a, b) => a.order - b.order);
}

/**
 * Get a single lesson by its ID.
 */
export function getLessonById(lessonId: string): Lesson | undefined {
  const existing = lessons.find((l) => l.id === lessonId);
  if (existing) return existing;

  const match = lessonId.match(/^([a-z]+)-u(\d+)-l(\d+)$/i);
  if (!match) return undefined;

  const langCode = match[1].toLowerCase();
  const unitNum = parseInt(match[2], 10);
  const orderNum = parseInt(match[3], 10);

  if (isNaN(unitNum) || isNaN(orderNum)) return undefined;

  const unitId = `${langCode}-unit-${unitNum}`;
  const unit = getUnitById(unitId);
  if (!unit) return undefined;

  const maxLessons = unit.lessonIds?.length || unit.totalLessons || 6;
  if (orderNum < 1 || orderNum > maxLessons) return undefined;

  return generateFallbackLesson(lessonId, unitId, orderNum, unit);
}

/**
 * Get all lessons for a specific language.
 */
export function getLessonsByLanguage(languageCode: string): Lesson[] {
  const u1 = getLessonsByUnit(`${languageCode}-unit-1`);
  const u2 = getLessonsByUnit(`${languageCode}-unit-2`);
  return [...u1, ...u2];
}
