import { StreamClient } from "@stream-io/node-sdk";

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

/**
 * POST /stream-token
 *
 * Generates a Stream Video user token server-side.
 * The Stream API secret never leaves this route.
 *
 * Body: { userId: string; userName?: string }
 * Returns: { token: string; apiKey: string }
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
    const { userId, userName } = body as {
      userId?: string;
      userName?: string;
    };

    if (!userId) {
      return Response.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const serverClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

    // Upsert the user so Stream knows about them
    await serverClient.upsertUsers([
      {
        id: userId,
        name: userName || userId,
        role: "user",
      },
    ]);

    // Generate a ~4-hour token
    const token = serverClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: 60 * 60 * 4,
    });

    return Response.json({
      token,
      apiKey: STREAM_API_KEY,
    });
  } catch (error) {
    console.error("Stream token generation failed:", error);
    return Response.json(
      { error: "Failed to generate Stream token" },
      { status: 500 }
    );
  }
}
