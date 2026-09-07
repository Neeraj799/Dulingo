import { StreamClient } from "@stream-io/node-sdk";
import { verifyClerkSession } from "@/lib/clerk";

const VISION_AGENT_URL =
  process.env.VISION_AGENT_URL || "http://127.0.0.1:8000";
const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

/**
 * POST /agent-start
 *
 * Proxies request to Vision Agent server to spawn an AI teacher agent
 * for the specified Stream call.
 * Requires Clerk authentication in the Authorization header and verifies
 * caller authorization for the targeted Stream call.
 *
 * Headers: Authorization: Bearer <clerk_session_token>
 * Body: { callId: string; callType?: string }
 * Returns: { sessionId: string; callId: string }
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
      callType?: string;
    };
    const { callId, callType = "default" } = body;

    if (!callId) {
      return Response.json(
        { error: "callId is required to start agent" },
        { status: 400 }
      );
    }

    // 2. Authorize caller access against the targeted Stream call
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
            { error: "Forbidden: Not authorized to start agent for this call" },
            { status: 403 }
          );
        }
      } catch (callErr) {
        console.error("Failed to verify Stream call for agent start:", callErr);
        return Response.json(
          { error: "Call not found or inaccessible" },
          { status: 404 }
        );
      }
    }

    // 3. Invoke Vision Agent operations only after authorization
    const agentRes = await fetch(
      `${VISION_AGENT_URL}/calls/${encodeURIComponent(callId)}/sessions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_type: callType }),
      }
    );

    if (!agentRes.ok) {
      const errText = await agentRes.text().catch(() => "");
      console.error(
        `Vision Agent start session failed (${agentRes.status}):`,
        errText
      );
      return Response.json(
        {
          error: `Vision Agent failed to start: ${agentRes.statusText || agentRes.status}`,
        },
        { status: agentRes.status }
      );
    }

    const data = (await agentRes.json()) as {
      session_id: string;
      call_id: string;
    };

    return Response.json({
      sessionId: data.session_id,
      callId: data.call_id,
    });
  } catch (error) {
    console.error("Failed to proxy agent-start request:", error);
    return Response.json(
      { error: "Failed to connect to Vision Agent server" },
      { status: 500 }
    );
  }
}
