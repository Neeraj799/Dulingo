const VISION_AGENT_URL =
  process.env.VISION_AGENT_URL || "http://127.0.0.1:8000";

/**
 * POST /agent-stop
 *
 * Proxies request to Vision Agent server to close an AI teacher agent session.
 *
 * Body: { callId: string; sessionId?: string }
 * Returns: { success: boolean }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { callId, sessionId } = body as {
      callId?: string;
      sessionId?: string;
    };

    if (!callId) {
      return Response.json(
        { error: "callId is required to stop agent" },
        { status: 400 }
      );
    }

    // If sessionId is provided, close the session via DELETE endpoint
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
