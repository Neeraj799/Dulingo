const VISION_AGENT_URL =
  process.env.VISION_AGENT_URL || "http://127.0.0.1:8000";

/**
 * POST /agent-start
 *
 * Proxies request to Vision Agent server to spawn an AI teacher agent
 * for the specified Stream call.
 *
 * Body: { callId: string; callType?: string }
 * Returns: { sessionId: string; callId: string }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { callId, callType = "default" } = body as {
      callId?: string;
      callType?: string;
    };

    if (!callId) {
      return Response.json(
        { error: "callId is required to start agent" },
        { status: 400 }
      );
    }

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
