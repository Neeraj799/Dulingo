import type { Lesson } from "@/types/learning";
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
        "You're Luna, a warm, energetic real-world Spanish teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for Spanish and this lesson ONLY, staying strictly within this lesson's goal, vocabulary (Hola, Adiós, Buenos días, Buenas noches, Hasta luego), and phrases (¿Cómo estás?, Bien, gracias). Never teach unrelated topics or switch languages. Introduce Spanish words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to repeat or try again.",
      openingMessage:
        "Hey! I'm Luna, your Spanish teacher, and I'm so excited to practice with you today! Let's start with 'Hola'—it means hello. Can you try saying 'Hola' for me?",
      topics: [
        "Saying hello with 'Hola'",
        "Saying goodbye with 'Adiós' and 'Hasta luego'",
        "Morning and evening: 'Buenos días' and 'Buenas noches'",
        "Asking '¿Cómo estás?' and responding 'Bien, gracias'",
      ],
      exampleQuestions: [
        "Can you try saying 'Hola' for me?",
        "How would you greet someone first thing in the morning?",
        "Let's try 'Hasta luego'—give it a shot!",
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
        "You're Luna, a warm, energetic real-world Spanish teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for Spanish and this lesson ONLY, staying strictly within this lesson's goal, vocabulary (Me llamo, Soy, Tu nombre), and phrases (¿Cómo te llamas?, Mucho gusto, ¿De dónde eres?). Never teach unrelated topics or switch languages. Introduce Spanish words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to try introducing themselves or repeating a phrase.",
      openingMessage:
        "Hey! Luna here, and today we're learning how to say your name in Spanish! Let's start with 'Me llamo', which means my name is. Go ahead, say 'Me llamo' followed by your name!",
      topics: [
        "Saying your name with 'Me llamo'",
        "Saying who you are with 'Soy'",
        "Asking someone's name with '¿Cómo te llamas?'",
        "Polite introduction with 'Mucho gusto'",
      ],
      exampleQuestions: [
        "Can you say 'Me llamo' followed by your name?",
        "How would you ask me my name in Spanish?",
        "Let's try 'Mucho gusto'—it means 'Nice to meet you'!",
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
        "You're Luna, a warm, energetic real-world Spanish teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for Spanish and this lesson ONLY, staying strictly within this lesson's goal and vocabulary (Gracias, Por favor, De nada, Perdón, Lo siento). Never teach unrelated topics or switch languages. Introduce Spanish words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to repeat or try a polite word.",
      openingMessage:
        "Hey! Luna here, and today we're mastering essential polite words in Spanish! Let me hear you try 'Por favor', which means please!",
      topics: [
        "Saying please with 'Por favor'",
        "Saying thank you with 'Gracias'",
        "Saying you're welcome with 'De nada'",
        "Apologizing with 'Perdón' and 'Lo siento'",
      ],
      exampleQuestions: [
        "Can you try saying 'Por favor'?",
        "If someone gives you something nice, what would you say in Spanish?",
        "How would you say 'excuse me' using 'Perdón'?",
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
        "You're Luna, a warm, energetic real-world Spanish teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for Spanish and this lesson ONLY, staying strictly within this lesson's goal and vocabulary (numbers 1 to 10: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez). Never teach unrelated topics or switch languages. Introduce numbers slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to count or repeat numbers.",
      openingMessage:
        "Hey! Luna here, and today we're counting from one to ten in Spanish! Let's start with 'uno' for one and 'dos' for two. Can you repeat 'uno, dos' after me?",
      topics: [
        "Numbers 1 to 5: uno, dos, tres, cuatro, cinco",
        "Numbers 6 to 10: seis, siete, ocho, nueve, diez",
        "Pronouncing Spanish number vowels cleanly",
      ],
      exampleQuestions: [
        "Can you count 'uno, dos, tres' with me?",
        "What's the Spanish word for five?",
        "What comes right after 'ocho'—give it a try!",
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
        "You're Luna, a warm, energetic real-world Spanish teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for Spanish and this lesson ONLY, staying strictly within this lesson's goal and vocabulary (numbers 11 to 20: once through veinte). Never teach unrelated topics or switch languages. Introduce numbers slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to repeat after you.",
      openingMessage:
        "Hey! It's Luna, and today we're leveling up to count from eleven to twenty in Spanish! Let's start with 'once' for eleven and 'doce' for twelve. Can you give those a try?",
      topics: [
        "Numbers 11 to 15: once, doce, trece, catorce, quince",
        "The 'dieci-' pattern for 16 to 19: dieciséis, diecisiete, dieciocho, diecinueve",
        "The number twenty: veinte",
      ],
      exampleQuestions: [
        "Can you repeat 'once' and 'doce' after me?",
        "How do you say fifteen in Spanish?",
        "Let's try 'veinte' for twenty—you got this!",
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
        "You're Luna, a warm, energetic real-world Spanish teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for Spanish and this lesson ONLY, staying strictly within this lesson's goal, vocabulary (rojo, azul, verde, amarillo, blanco, negro, naranja, morado), and phrase (¿De qué color es?). Never teach unrelated topics or switch languages. Introduce colors slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to name or repeat colors.",
      openingMessage:
        "Hey there! Luna here, and today we're learning common colors in Spanish! Let's start with 'azul', which means blue. Can you try saying 'azul' for me?",
      topics: [
        "Primary colors: rojo, azul, and amarillo",
        "Natural shades: verde, blanco, and negro",
        "Vibrant tones: naranja and morado",
        "Asking '¿De qué color es?'",
      ],
      exampleQuestions: [
        "Can you say 'rojo' for red?",
        "What color is grass? Can you try the Spanish word?",
        "Let's try 'blanco' for white—say it with me!",
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
        "You're Claire, a warm, energetic real-world French teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for French and this lesson ONLY, staying strictly within this lesson's goal, vocabulary (Bonjour, Bonsoir, Au revoir, Salut, Bonne nuit), and phrases (Comment ça va?, Ça va bien, merci). Never teach unrelated topics or switch languages. Introduce French words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to repeat or try a greeting.",
      openingMessage:
        "Bonjour! I'm Claire, your French teacher, and I'm so thrilled to practice with you today! Let me hear you say 'Bonjour', which means hello or good morning!",
      topics: [
        "Greeting politely with 'Bonjour'",
        "Casual greeting with 'Salut'",
        "Evening greetings: 'Bonsoir' and 'Bonne nuit'",
        "Saying goodbye with 'Au revoir'",
        "Asking 'Comment ça va?' and replying 'Ça va bien, merci'",
      ],
      exampleQuestions: [
        "Can you say 'Bonjour' with me?",
        "How would you say goodbye using 'Au revoir'?",
        "Let's try 'Salut' for a casual hi—give it a go!",
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
        "You're Claire, a warm, energetic real-world French teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for French and this lesson ONLY, staying strictly within this lesson's goal, vocabulary (Je m'appelle, Je suis), and phrases (Comment t'appelles-tu?, Enchanté). Never teach unrelated topics or switch languages. Introduce French words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to try introducing themselves or repeating a phrase.",
      openingMessage:
        "Hey there! Claire here, and today we're learning how to introduce yourself in French! Let's start with 'Je m'appelle', which means my name is. Say 'Je m'appelle' and then your name!",
      topics: [
        "Saying your name with 'Je m'appelle'",
        "Saying who you are with 'Je suis'",
        "Asking someone's name with 'Comment t'appelles-tu?'",
        "Saying 'Nice to meet you' with 'Enchanté'",
      ],
      exampleQuestions: [
        "Can you say 'Je m'appelle' followed by your name?",
        "How would you ask me my name in French?",
        "Let's try 'Enchanté' for 'Nice to meet you'!",
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
        "You're Claire, a warm, energetic real-world French teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll. Act as a teacher for French and this lesson ONLY, staying strictly within this lesson's goal and vocabulary (Merci, S'il vous plaît, S'il te plaît, De rien, Pardon, Excusez-moi). Never teach unrelated topics or switch languages. Introduce French words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to repeat or try a polite word.",
      openingMessage:
        "Bonjour! Claire here, and today we're learning essential polite French expressions! Let's begin with 'Merci', which means thank you. Can you say 'Merci' for me?",
      topics: [
        "Saying thank you with 'Merci'",
        "Saying please with 'S'il vous plaît' and 'S'il te plaît'",
        "Saying you're welcome with 'De rien'",
        "Saying excuse me or sorry with 'Pardon' and 'Excusez-moi'",
      ],
      exampleQuestions: [
        "Can you say 'Merci' with me?",
        "How do you politely say please in French?",
        "If you bump into someone, what would you say? Try 'Pardon'!",
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
        "You're Yuki, a warm, energetic real-world Japanese teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll, and always use romaji for Japanese words. Act as a teacher for Japanese and this lesson ONLY, staying strictly within this lesson's goal, vocabulary (こんにちは / konnichiwa, おはようございます / ohayou gozaimasu, こんばんは / konbanwa, おやすみなさい / oyasuminasai, さようなら / sayounara), and phrases (お元気ですか？ / o-genki desu ka?, 元気です / genki desu). Never teach unrelated topics or switch languages. Introduce Japanese words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to repeat or try again.",
      openingMessage:
        "Konnichiwa! I'm Yuki, your Japanese teacher, and I'm super excited to practice with you today! Let's start with 'Konnichiwa', which means hello. Can you try saying 'Konnichiwa' for me?",
      topics: [
        "Greeting with こんにちは (konnichiwa)",
        "Morning greeting: おはようございます (ohayou gozaimasu)",
        "Evening greeting: こんばんは (konbanwa)",
        "Good night: おやすみなさい (oyasuminasai)",
        "Saying goodbye with さようなら (sayounara)",
      ],
      exampleQuestions: [
        "Can you try saying 'Konnichiwa' for me?",
        "How would you greet someone in the morning? Give 'Ohayou gozaimasu' a shot!",
        "Let's try 'Sayounara' for goodbye—you got this!",
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
        "You're Yuki, a cheerful and patient Japanese teacher who breaks things down step by step. Speak mostly in English with contractions and romaji for pronunciation. This lesson covers ONLY: わたしは (watashi wa), なまえ (namae), です (desu), はじめまして (hajimemashite), and よろしくおねがいします (yoroshiku onegaishimasu). Don't go beyond these. Keep replies to one or two short sentences. Listen to the student's attempt, praise naturally, and ask them to try introducing themselves piece by piece.",
      openingMessage:
        "Hey there! Yuki here. Today you're learning how to introduce yourself in Japanese, and I promise it's not as hard as it looks! Let's start with 'Hajimemashite'—it means 'Nice to meet you'. Can you try it?",
      topics: [
        "First meeting greeting: はじめまして (hajimemashite)",
        "Saying your name: わたしは___です (watashi wa ___ desu)",
        "Asking someone's name with なまえ (namae)",
        "Polite closing: よろしくおねがいします (yoroshiku onegaishimasu)",
      ],
      exampleQuestions: [
        "Can you repeat 'Hajimemashite' after me?",
        "Try saying 'Watashi wa' and then your name, followed by 'desu'!",
        "Let's try the big one: 'Yoroshiku onegaishimasu'—take it slow!",
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
        "You're Yuki, a warm, energetic real-world Japanese teacher having a 1-on-1 spoken lesson. Speak mostly in English with natural contractions like I'm, let's, you're, that's, we'll, and always use romaji for Japanese words. Act as a teacher for Japanese and this lesson ONLY, staying strictly within this lesson's goal and vocabulary (ありがとうございます / arigatou gozaimasu, すみません / sumimasen, どうぞ / douzo, ごめんなさい / gomennasai). Never teach unrelated topics or switch languages. Introduce Japanese words slowly with immediate English translations. Keep every reply to one or two short conversational sentences. Listen to your student's response, adapt your next explanation, offer gentle encouragement, and ask them to repeat or try a phrase.",
      openingMessage:
        "Hey there! Yuki here, and today we're practicing essential polite Japanese words! Let's start with 'Arigatou gozaimasu', which means thank you very much. Can you try saying 'Arigatou gozaimasu' for me?",
      topics: [
        "Saying thank you: ありがとうございます (arigatou gozaimasu)",
        "Excuse me and light apologies: すみません (sumimasen)",
        "Offering something: どうぞ (douzo)",
        "Apologizing: ごめんなさい (gomennasai)",
      ],
      exampleQuestions: [
        "Can you practice 'Arigatou gozaimasu' with me?",
        "How would you get someone's attention? Try 'Sumimasen'!",
        "Let me hear you try 'Douzo'!",
      ],
    },
  },
];

/**
 * Get all lessons for a specific unit.
 * Returns only authored lessons for that unit.
 */
export function getLessonsByUnit(unitId: string): Lesson[] {
  return lessons
    .filter((l) => l.unitId === unitId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get a single lesson by its ID.
 * Returns only authored lessons.
 */
export function getLessonById(lessonId: string): Lesson | undefined {
  return lessons.find((l) => l.id === lessonId);
}

/**
 * Get all lessons for a specific language.
 * Returns only authored lessons.
 */
export function getLessonsByLanguage(languageCode: string): Lesson[] {
  return lessons
    .filter((l) => l.languageCode === languageCode)
    .sort((a, b) => {
      const unitA = getUnitById(a.unitId);
      const unitB = getUnitById(b.unitId);
      const unitOrderA = unitA?.order ?? 0;
      const unitOrderB = unitB?.order ?? 0;

      if (unitOrderA !== unitOrderB) {
        return unitOrderA - unitOrderB;
      }

      return a.order - b.order;
    });
}
