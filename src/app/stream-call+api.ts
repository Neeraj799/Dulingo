import { StreamClient } from "@stream-io/node-sdk";

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

/**
 * POST /stream-call
 *
 * Creates (or gets) a Stream call server-side and returns the call info.
 * This ensures call creation is authorized and traceable.
 *
 * Body: {
 *   callId: string;
 *   userId: string;
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

    const body = await request.json();
    const {
      callId,
      userId,
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
      userId?: string;
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

    if (!callId || !userId) {
      return Response.json(
        { error: "callId and userId are required" },
        { status: 400 }
      );
    }

    const serverClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET, {
      timeout: 15000,
    });

    // Create or get the call with lesson metadata
    const call = serverClient.video.call("default", callId);

    await call.getOrCreate({
      data: {
        created_by_id: userId,
        members: [
          { user_id: userId, role: "admin" },
          { user_id: "language_teacher_agent", role: "admin" },
        ],
        custom: {
          lessonId: lessonId || "unknown",
          lessonTitle: lessonTitle || "AI Audio Lesson",
          languageCode: languageCode || "es",
          languageName: languageName || "Spanish",
          goal: goal || null,
          vocabulary: vocabulary || [],
          phrases: phrases || [],
          aiTeacherPrompt: aiTeacherPrompt || null,
          createdBy: userName || userId,
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
