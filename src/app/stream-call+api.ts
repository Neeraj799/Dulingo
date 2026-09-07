import { StreamClient } from "@stream-io/node-sdk";
import { verifyClerkSession } from "@/lib/clerk";
import { getLessonById } from "@/data/lessons";
import { getLanguageByCode } from "@/data/languages";

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

function sanitizeGoal(goal: unknown): Record<string, unknown> | null {
  if (!goal || typeof goal !== "object" || Array.isArray(goal)) {
    return null;
  }
  const g = goal as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  if (typeof g.description === "string" && g.description.trim()) {
    result.description = g.description.trim().slice(0, 300);
  }
  if (typeof g.xpReward === "number" && !Number.isNaN(g.xpReward)) {
    result.xpReward = Math.max(0, Math.min(1000, Math.floor(g.xpReward)));
  }
  return Object.keys(result).length > 0 ? result : null;
}

function sanitizeVocabulary(vocabulary: unknown): Record<string, unknown>[] {
  if (!Array.isArray(vocabulary)) {
    return [];
  }
  const result: Record<string, unknown>[] = [];
  for (const item of vocabulary.slice(0, 30)) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const v = item as Record<string, unknown>;
      if (typeof v.word === "string" && v.word.trim()) {
        result.push({
          word: v.word.trim().slice(0, 100),
          translation:
            typeof v.translation === "string"
              ? v.translation.trim().slice(0, 100)
              : "",
          pronunciation:
            typeof v.pronunciation === "string"
              ? v.pronunciation.trim().slice(0, 100)
              : undefined,
          exampleSentence:
            typeof v.exampleSentence === "string"
              ? v.exampleSentence.trim().slice(0, 200)
              : undefined,
          exampleTranslation:
            typeof v.exampleTranslation === "string"
              ? v.exampleTranslation.trim().slice(0, 200)
              : undefined,
        });
      }
    }
  }
  return result;
}

function sanitizePhrases(phrases: unknown): Record<string, unknown>[] {
  if (!Array.isArray(phrases)) {
    return [];
  }
  const result: Record<string, unknown>[] = [];
  for (const item of phrases.slice(0, 30)) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const p = item as Record<string, unknown>;
      if (typeof p.phrase === "string" && p.phrase.trim()) {
        result.push({
          phrase: p.phrase.trim().slice(0, 200),
          translation:
            typeof p.translation === "string"
              ? p.translation.trim().slice(0, 200)
              : "",
          pronunciation:
            typeof p.pronunciation === "string"
              ? p.pronunciation.trim().slice(0, 100)
              : undefined,
          context:
            typeof p.context === "string"
              ? p.context.trim().slice(0, 200)
              : undefined,
        });
      }
    }
  }
  return result;
}

function sanitizeClientAiPrompt(
  prompt: unknown
): Record<string, unknown> | null {
  if (!prompt || typeof prompt !== "object" || Array.isArray(prompt)) {
    return null;
  }
  const p = prompt as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  // Omit untrusted client-provided systemPrompt to prevent controlling agent prompt instructions
  if (typeof p.openingMessage === "string" && p.openingMessage.trim()) {
    result.openingMessage = p.openingMessage.trim().slice(0, 200);
  }
  if (Array.isArray(p.topics)) {
    result.topics = p.topics
      .filter((t): t is string => typeof t === "string" && Boolean(t.trim()))
      .slice(0, 10)
      .map((t) => t.trim().slice(0, 50));
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * POST /stream-call
 *
 * Creates (or gets) a Stream call server-side and returns the call info.
 * Requires Clerk authentication in the Authorization header.
 * Derives userId server-side from the verified Clerk session.
 *
 * Headers: Authorization: Bearer <clerk_session_token>
 * Body: {
 *   callId: string;
 *   userName?: string;
 *   lessonTitle?: string;
 *   languageCode?: string;
 * }
 * Returns: { callId: string; callType: string }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      return Response.json(
        { error: "Stream API credentials not configured on the server" },
        { status: 500 }
      );
    }

    // 1. Authenticate caller using Clerk session token
    let auth: { userId: string };
    try {
      auth = await verifyClerkSession(request);
    } catch (authErr) {
      const message =
        authErr instanceof Error ? authErr.message : "Unauthorized";
      return Response.json({ error: message }, { status: 401 });
    }

    const userId = auth.userId;

    const body = (await request.json().catch(() => ({}))) as Record<string, any>;
    const {
      callId,
      userName,
      lessonId,
      lessonTitle,
      languageCode,
      languageName,
      goal,
      vocabulary,
      phrases,
      aiTeacherPrompt,
    } = body as {
      callId?: string;
      userName?: string;
      lessonId?: string;
      lessonTitle?: string;
      languageCode?: string;
      languageName?: string;
      goal?: Record<string, unknown>;
      vocabulary?: Record<string, unknown>[];
      phrases?: Record<string, unknown>[];
      aiTeacherPrompt?: Record<string, unknown>;
    };

    if (!callId || typeof callId !== "string" || callId.length > 128) {
      return Response.json(
        { error: "callId is required and must be a string up to 128 characters" },
        { status: 400 }
      );
    }

    const rawLessonId =
      typeof lessonId === "string" && lessonId.trim()
        ? lessonId.trim().slice(0, 100)
        : "";

    // Load server-side lesson if a matching lessonId exists to prevent untrusted prompt control
    const serverLesson = rawLessonId ? getLessonById(rawLessonId) : undefined;

    const resolvedLessonId = serverLesson?.id || rawLessonId || "unknown";
    const resolvedLessonTitle =
      serverLesson?.title ||
      (typeof lessonTitle === "string" && lessonTitle.trim()
        ? lessonTitle.trim().slice(0, 100)
        : "AI Audio Lesson");
    const resolvedLanguageCode =
      serverLesson?.languageCode ||
      (typeof languageCode === "string" && languageCode.trim()
        ? languageCode.trim().slice(0, 10)
        : "es");
    const resolvedLanguageName =
      (serverLesson
        ? getLanguageByCode(serverLesson.languageCode)?.name
        : undefined) ||
      (typeof languageName === "string" && languageName.trim()
        ? languageName.trim().slice(0, 50)
        : getLanguageByCode(resolvedLanguageCode)?.name || "Spanish");

    const resolvedGoal = serverLesson?.goal
      ? (serverLesson.goal as unknown as Record<string, unknown>)
      : sanitizeGoal(goal);

    const resolvedVocabulary = serverLesson?.vocabulary
      ? (serverLesson.vocabulary as unknown as Record<string, unknown>[])
      : sanitizeVocabulary(vocabulary);

    const resolvedPhrases = serverLesson?.phrases
      ? (serverLesson.phrases as unknown as Record<string, unknown>[])
      : sanitizePhrases(phrases);

    const resolvedAiTeacherPrompt = serverLesson?.aiTeacherPrompt
      ? (serverLesson.aiTeacherPrompt as unknown as Record<string, unknown>)
      : sanitizeClientAiPrompt(aiTeacherPrompt);

    const resolvedCreatedBy =
      typeof userName === "string" && userName.trim()
        ? userName.trim().slice(0, 100)
        : userId;

    const serverClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET, {
      timeout: 15000,
    });

    // Create or get the call with lesson metadata
    const call = serverClient.video.call("default", callId);

    // 2. Authorize access if the call already exists
    try {
      const existing = await call.get();
      const createdById = existing.call?.created_by?.id;
      const isMember = existing.members?.some(
        (m: any) => m.user_id === userId || m.user?.id === userId
      );

      if ((!createdById || createdById !== userId) && !isMember) {
        return Response.json(
          { error: "Forbidden: Not authorized to access this call" },
          { status: 403 }
        );
      }
    } catch (callErr) {
      const status =
        (callErr as any)?.metadata?.responseCode ??
        (callErr as any)?.status ??
        (callErr as any)?.statusCode ??
        (callErr as any)?.response?.status;
      const errCode = (callErr as any)?.code;
      const errMsg =
        callErr instanceof Error ? callErr.message : String(callErr);

      const isNotFound =
        status === 404 ||
        errCode === 404 ||
        errCode === 16 ||
        (/\b(not found|does not exist)\b/i.test(errMsg) &&
          status !== 401 &&
          status !== 403);

      if (!isNotFound) {
        console.error("Failed to verify Stream call for call creation:", callErr);

        const isAuthError =
          status === 401 ||
          status === 403 ||
          errCode === 401 ||
          errCode === 403 ||
          errCode === 17 ||
          /\b(unauthorized|forbidden|not allowed|permission denied)\b/i.test(
            errMsg
          );

        if (isAuthError) {
          return Response.json(
            { error: "Forbidden: Not authorized to access this call" },
            { status: 403 }
          );
        }

        return Response.json(
          { error: "Failed to verify call status with upstream service" },
          { status: 502 }
        );
      }
      // Call does not exist yet; proceed to create it
    }

    await call.getOrCreate({
      data: {
        created_by_id: userId,
        members: [
          { user_id: userId, role: "admin" },
          { user_id: "language_teacher_agent", role: "admin" },
        ],
        custom: {
          lessonId: resolvedLessonId,
          lessonTitle: resolvedLessonTitle,
          languageCode: resolvedLanguageCode,
          languageName: resolvedLanguageName,
          goal: resolvedGoal,
          vocabulary: resolvedVocabulary,
          phrases: resolvedPhrases,
          aiTeacherPrompt: resolvedAiTeacherPrompt,
          createdBy: resolvedCreatedBy,
        },
        settings_override: {
          audio: { mic_default_on: true, default_device: "speaker" },
        },
      },
    });

    return Response.json({
      callId,
      callType: "default",
    });
  } catch (error) {
    console.error("Stream call creation failed:", error);
    return Response.json(
      { error: "Failed to create Stream call" },
      { status: 500 }
    );
  }
}
