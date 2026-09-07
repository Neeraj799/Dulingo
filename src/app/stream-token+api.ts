import { StreamClient } from "@stream-io/node-sdk";
import { verifyClerkSession } from "@/lib/clerk";

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

/**
 * POST /stream-token
 *
 * Generates a Stream Video user token server-side for the authenticated Clerk user.
 * Requires a valid Clerk session bearer token in the Authorization header.
 * The Stream API secret never leaves this route.
 *
 * Headers: Authorization: Bearer <clerk_session_token>
 * Body: { userName?: string }
 * Returns: { token: string; apiKey: string; userId: string }
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

    // 2. Parse optional request body for display name only
    const body = (await request.json().catch(() => ({}))) as {
      userName?: string;
    };
    const userName = body?.userName;

    const serverClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

    // 3. Upsert the authenticated user so Stream knows about them
    await serverClient.upsertUsers([
      {
        id: userId,
        name: userName || userId,
        role: "user",
      },
    ]);

    // 4. Generate a ~4-hour token for the authenticated user ID
    const token = serverClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: 60 * 60 * 4,
    });

    return Response.json({
      token,
      apiKey: STREAM_API_KEY,
      userId,
    });
  } catch (error) {
    console.error("Stream token generation failed:", error);
    return Response.json(
      { error: "Failed to generate Stream token" },
      { status: 500 }
    );
  }
}
