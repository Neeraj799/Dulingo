import { StreamClient } from "@stream-io/node-sdk";
import { verifyClerkSession } from "@/lib/clerk";

const VISION_AGENT_URL =
  process.env.VISION_AGENT_URL || "http://127.0.0.1:8000";
const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

/**
 * POST /agent-stop
 *
 * Proxies request to Vision Agent server to close an AI teacher agent session.
 * Requires Clerk authentication in the Authorization header and verifies
 * caller authorization for the targeted Stream call.
 *
 * Headers: Authorization: Bearer <clerk_session_token>
 * Body: { callId: string; sessionId?: string; callType?: string }
 * Returns: { success: boolean }
 */
export async function POST(request: Request): Promise<Response> {
  try {
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

    const body = (await request.json().catch(() => ({}))) as {
      callId?: string;
      sessionId?: string;
      callType?: string;
    };
    const { callId, sessionId } = body;

    if (!callId || typeof callId !== "string" || !callId.trim()) {
      return Response.json(
        { error: "callId is required to stop agent" },
        { status: 400 }
      );
    }

    if (
      body.callType !== undefined &&
      (typeof body.callType !== "string" || !body.callType.trim())
    ) {
      return Response.json(
        { error: "callType must be a non-empty string" },
        { status: 400 }
      );
    }

    const callType =
      typeof body.callType === "string" && body.callType.trim()
        ? body.callType.trim()
        : "default";

    // 2. Authorize caller access against targeted Stream call
    if (STREAM_API_KEY && STREAM_API_SECRET) {
      try {
        const serverClient = new StreamClient(
          STREAM_API_KEY,
          STREAM_API_SECRET,
          { timeout: 15000 }
        );
        const call = serverClient.video.call(callType, callId);
        const callInfo = await call.get();
        const createdById = callInfo.call?.created_by?.id;
        const isMember = callInfo.members?.some(
          (m: any) => m.user_id === userId || m.user?.id === userId
        );

        if (createdById && createdById !== userId && !isMember) {
          return Response.json(
            { error: "Forbidden: Not authorized to stop agent for this call" },
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

        if (isNotFound) {
          // If the call is definitively not found/ended, log and continue session cleanup
          console.warn(
            "Call definitively not found during agent-stop, continuing session cleanup:",
            callErr
          );
        } else {
          console.error("Failed to verify Stream call for agent stop:", callErr);

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
              { error: "Forbidden: Not authorized to stop agent for this call" },
              { status: 403 }
            );
          }

          return Response.json(
            { error: "Failed to verify call status with upstream service" },
            { status: 502 }
          );
        }
      }
    }

    // 3. If sessionId is provided, close the session via DELETE endpoint
    if (sessionId) {
      await fetch(
        `${VISION_AGENT_URL}/calls/${encodeURIComponent(callId)}/sessions/${encodeURIComponent(sessionId)}`,
        { method: "DELETE" }
      ).catch(() => {});
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to proxy agent-stop request:", error);
    return Response.json(
      { error: "Failed to stop Vision Agent session" },
      { status: 500 }
    );
  }
}
