interface ClerkJwk {
  kid: string;
  kty: string;
  alg: string;
  n: string;
  e: string;
  use?: string;
}

interface ClerkJwksResponse {
  keys: ClerkJwk[];
}

let jwksCache: {
  keys: Map<string, CryptoKey>;
  expiresAt: number;
} | null = null;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return atob(base64);
}

function base64UrlToBytes(str: string): Uint8Array {
  const binary = base64UrlDecode(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives the Clerk JWKS URL from the publishable key or environment variable.
 */
function getJwksUrl(): string {
  if (process.env.CLERK_JWKS_URL) {
    return process.env.CLERK_JWKS_URL;
  }

  const pubKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY;

  if (!pubKey) {
    throw new Error(
      "Clerk publishable key not configured (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY)"
    );
  }

  // Format: pk_test_<base64> or pk_live_<base64>
  const parts = pubKey.split("_");
  if (parts.length >= 3) {
    const raw = parts.slice(2).join("_");
    try {
      const decoded = atob(raw).replace(/[$]$/, "");
      return `https://${decoded}/.well-known/jwks.json`;
    } catch {
      // Fallback
    }
  }

  throw new Error("Failed to parse Clerk Frontend API URL from publishable key");
}

/**
 * Fetches and caches Clerk JWKS public keys.
 */
async function getPublicKeyForKid(kid?: string): Promise<CryptoKey> {
  const now = Date.now();

  // If cached and not expired
  if (jwksCache && jwksCache.expiresAt > now) {
    if (kid && jwksCache.keys.has(kid)) {
      return jwksCache.keys.get(kid)!;
    }
    // If no kid was specified and we have at least one key, return first
    if (!kid && jwksCache.keys.size > 0) {
      return jwksCache.keys.values().next().value!;
    }
    throw new Error(`Public key with kid "${kid}" not found in Clerk JWKS`);
  }

  // Fetch JWKS
  const jwksUrl = getJwksUrl();
  const res = await fetch(jwksUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch Clerk JWKS from ${jwksUrl}: ${res.status}`);
  }

  const data = (await res.json()) as ClerkJwksResponse;
  if (!data.keys || !Array.isArray(data.keys) || data.keys.length === 0) {
    throw new Error("No keys returned in Clerk JWKS response");
  }

  const keyMap = new Map<string, CryptoKey>();
  for (const jwk of data.keys) {
    try {
      const cryptoKey = await crypto.subtle.importKey(
        "jwk",
        jwk as JsonWebKey,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        },
        false,
        ["verify"]
      );
      keyMap.set(jwk.kid, cryptoKey);
    } catch (err) {
      console.warn(`Failed to import JWK with kid ${jwk.kid}:`, err);
    }
  }

  jwksCache = {
    keys: keyMap,
    expiresAt: now + CACHE_TTL_MS,
  };

  if (kid && keyMap.has(kid)) {
    return keyMap.get(kid)!;
  }

  if (!kid && keyMap.size > 0) {
    return keyMap.values().next().value!;
  }

  throw new Error(`Public key with kid "${kid}" not found in Clerk JWKS`);
}

/**
 * Verifies a Clerk session bearer token from an incoming Request.
 * Returns the authenticated user's ID.
 */
export async function verifyClerkSession(
  request: Request
): Promise<{ userId: string }> {
  const authHeader =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Unauthorized: Missing Authorization header");
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1].trim()) {
    throw new Error("Unauthorized: Missing or invalid Bearer token");
  }

  const token = match[1].trim();

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Unauthorized: Invalid JWT format");
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header: { alg?: string; kid?: string; typ?: string };
  let payload: { sub?: string; exp?: number; nbf?: number; iss?: string };

  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new Error("Unauthorized: Failed to parse JWT payload");
  }

  if (header.alg !== "RS256") {
    throw new Error(`Unauthorized: Unsupported token algorithm ${header.alg}`);
  }

  // Obtain public key from Clerk JWKS
  const publicKey = await getPublicKeyForKid(header.kid);

  // Verify RS256 signature using Web Crypto
  const encoder = new TextEncoder();
  const signedData = encoder.encode(`${headerB64}.${payloadB64}`);
  const signatureBytes = base64UrlToBytes(signatureB64);

  const isValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    signatureBytes as BufferSource,
    signedData
  );

  if (!isValid) {
    throw new Error("Unauthorized: Invalid token signature");
  }

  // Check expiration and validity window with standard clock skew leeway
  const nowSec = Math.floor(Date.now() / 1000);
  const CLOCK_TOLERANCE_SEC = 60;
  if (payload.exp && nowSec >= payload.exp + CLOCK_TOLERANCE_SEC) {
    throw new Error("Unauthorized: Token has expired");
  }
  if (payload.nbf && nowSec < payload.nbf - CLOCK_TOLERANCE_SEC) {
    throw new Error("Unauthorized: Token is not yet valid");
  }

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Unauthorized: Token missing subject user ID");
  }

  return { userId: payload.sub };
}
