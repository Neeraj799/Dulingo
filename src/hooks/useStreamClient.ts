import { useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
import { useAuth, useUser } from "@clerk/expo";
import { getApiUrl } from "@/lib/api";

/**
 * Dynamically imports and initialises a StreamVideoClient for the current
 * Clerk user.  The Stream Video SDK contains native WebRTC code that is
 * unavailable on the web or Expo Go, so we guard the import behind a NativeModules check
 * and resolve everything asynchronously.
 *
 * Returns `{ client, isReady }`:
 *  - `client` is `undefined` while the user is unsigned-in or the SDK is loading.
 *  - `isReady` flips to `true` once the client has been created.
 *
 * On sign-out / unmount the hook calls `disconnectUser()` and drops the ref.
 */

type AnyStreamVideoClient = any;

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

export function useStreamClient() {
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();
  const [client, setClient] = useState<AnyStreamVideoClient | undefined>();
  const [isReady, setIsReady] = useState(
    Platform.OS === "web" || !NativeModules?.WebRTCModule
  );

  useEffect(() => {
    // Only initialise on native if WebRTC native module is linked (not Expo Go or web).
    if (Platform.OS === "web" || !NativeModules?.WebRTCModule) {
      return;
    }

    if (!isSignedIn || !user || !STREAM_API_KEY) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClient(undefined);
      setIsReady(false);
      return;
    }

    let cancelled = false;
    let currentClient: AnyStreamVideoClient | undefined;

    (async () => {
      try {
        // Dynamic import keeps the native module out of the web bundle.
        const mod = await import("@stream-io/video-react-native-sdk");

        if (cancelled) return;

        if (!mod || !mod.StreamVideoClient) {
          console.warn(
            "StreamVideoClient is not available (WebRTC native module missing, e.g. in Expo Go)."
          );
          setIsReady(true);
          return;
        }

        const { StreamVideoClient } = mod;

        const streamUser = {
          id: user.id,
          name:
            user.fullName ||
            user.primaryEmailAddress?.emailAddress ||
            user.id,
          image: user.imageUrl,
        };

        const tokenProvider = async (): Promise<string> => {
          const sessionToken = await getToken();
          const res = await fetch(getApiUrl("/stream-token"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(sessionToken
                ? { Authorization: `Bearer ${sessionToken}` }
                : {}),
            },
            body: JSON.stringify({
              userName: streamUser.name,
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(
              (errData as { error?: string })?.error ||
                `Token fetch failed: ${res.status}`
            );
          }
          const data = await res.json();
          return data.token as string;
        };

        currentClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: streamUser,
          tokenProvider,
        });

        // Ensure location hint bypasses SFU edges experiencing regional outages/timeouts
        if (currentClient?.streamClient) {
          const origGetLocation = currentClient.streamClient.getLocationHint?.bind(
            currentClient.streamClient
          );
          currentClient.streamClient.getLocationHint = async (...args: any[]) => {
            try {
              const hint = origGetLocation ? await origGetLocation(...args) : "IAD";
              if (
                !hint ||
                hint === "MAA" ||
                hint === "BOM" ||
                hint === "HYD" ||
                hint === "ERR"
              ) {
                return "IAD";
              }
              return hint;
            } catch {
              return "IAD";
            }
          };
        }

        if (!cancelled) {
          setClient(currentClient);
          setIsReady(true);
        }
      } catch (err) {
        console.warn("Failed to create StreamVideoClient:", err);
        if (!cancelled) {
          setIsReady(true); // let the app render even on failure
        }
      }
    })();

    return () => {
      cancelled = true;
      if (currentClient) {
        currentClient
          .disconnectUser()
          .catch((err: unknown) =>
            console.error("StreamVideoClient disconnect error:", err)
          );
        setClient(undefined);
        setIsReady(false);
      }
    };
    // Re-run when the signed-in identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user?.id]);

  return { client, isReady };
}
