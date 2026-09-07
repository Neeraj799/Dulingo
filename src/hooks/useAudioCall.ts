import { useCallback, useEffect, useRef, useState } from "react";
import { NativeModules, PermissionsAndroid, Platform } from "react-native";
import { getApiUrl } from "@/lib/api";

/**
 * Request runtime RECORD_AUDIO permission on Android.
 * On iOS, permission is handled via Info.plist and native WebRTC prompts.
 */
async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: "Microphone Permission",
          message: "Lingoza requires microphone access for audio lessons.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Microphone permission request error:", err);
      return false;
    }
  }
  return true;
}

/**
 * Audio call lifecycle states rendered in the UI.
 *
 * idle       – no call has been started yet
 * loading    – calling the server to create the call
 * joining    – SDK is connecting to the SFU
 * joined     – audio is flowing
 * ended      – the call was left cleanly
 * error      – something went wrong
 */
export type AudioCallState =
  | "idle"
  | "loading"
  | "joining"
  | "joined"
  | "ended"
  | "error";

/**
 * Vision Agent connection states rendered in the UI.
 *
 * idle       – no agent session active
 * connecting – requesting agent to join the call
 * connected  – agent joined successfully
 * failed     – agent failed to join
 */
export type AgentState = "idle" | "connecting" | "connected" | "failed";

interface UseAudioCallOptions {
  lessonId: string;
  languageCode: string;
  languageName?: string;
  lessonTitle: string;
  userId: string;
  userName: string;
  goal?: Record<string, unknown>;
  vocabulary?: Record<string, unknown>[];
  phrases?: Record<string, unknown>[];
  aiTeacherPrompt?: Record<string, unknown>;
}

interface UseAudioCallReturn {
  callState: AudioCallState;
  agentState: AgentState;
  isMuted: boolean;
  error: string | null;
  participantCount: number;
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
}

/**
 * Manages a Stream audio-only call for a lesson and coordinates with the Vision Agent.
 *
 * – Creates the call server-side via `/stream-call` with complete lesson metadata
 * – Joins with `call.join({ create: true })`
 * – Spawns AI teacher Vision Agent via `/agent-start`
 * – Exposes mute toggle, end call, call state, and agent connection state
 * – Cleans up agent session & call on endCall or unmount
 */
export function useAudioCall(
  options: UseAudioCallOptions
): UseAudioCallReturn {
  const {
    lessonId,
    languageCode,
    languageName,
    lessonTitle,
    userId,
    userName,
    goal,
    vocabulary,
    phrases,
    aiTeacherPrompt,
  } = options;

  const [callState, setCallState] = useState<AudioCallState>("idle");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);

  const callRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const callIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);
  const agentStateRef = useRef<AgentState>("idle");

  // Cleanup on unmount: stop agent session & leave the call if still active
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      agentStateRef.current = "idle";

      // 1. Clean up Vision Agent session on unmount
      if (callIdRef.current) {
        const activeCallId = callIdRef.current;
        const activeSessionId = sessionIdRef.current;
        callIdRef.current = null;
        sessionIdRef.current = null;

        fetch(getApiUrl("/agent-stop"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId: activeCallId,
            sessionId: activeSessionId || undefined,
          }),
        }).catch((err) =>
          console.error("Agent stop on unmount fetch error:", err)
        );
      }

      // 2. Leave Stream call
      const call = callRef.current;
      if (!call) return;

      import("@stream-io/video-react-native-sdk")
        .then(({ CallingState }) => {
          if (call.state.callingState !== CallingState.LEFT) {
            call
              .leave()
              .catch((err: unknown) =>
                console.error("Call leave on unmount error:", err)
              );
          }
        })
        .catch(() => {
          try {
            call.leave();
          } catch {
            // swallow
          }
        });

      callRef.current = null;
    };
  }, []);

  const startCall = useCallback(async () => {
    if (Platform.OS === "web" || !NativeModules?.WebRTCModule) {
      setError(
        "Stream calls require a custom dev build (npx expo run:android / ios) because native WebRTC is not supported in Expo Go."
      );
      setCallState("error");
      agentStateRef.current = "failed";
      setAgentState("failed");
      return;
    }

    try {
      setCallState("loading");
      agentStateRef.current = "idle";
      setAgentState("idle");
      setError(null);

      // 1. Create call server-side with packed lesson context and unique session suffix
      const sessionSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const safeUserId = (userId || "learner").replace(/[^a-zA-Z0-9_-]/g, "_").slice(-12);
      const callId = `lesson-${lessonId}-${safeUserId}-${sessionSuffix}`.replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );
      callIdRef.current = callId;

      const createRes = await fetch(getApiUrl("/stream-call"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      if (!createRes.ok) {
        const errBody = await createRes.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error ||
            `Call creation failed: ${createRes.status}`
        );
      }

      if (!mountedRef.current) return;

      // 2. Get the Stream Video client via dynamic import
      let mod;
      try {
        mod = await import("@stream-io/video-react-native-sdk");
      } catch {
        throw new Error(
          "Stream calls require a custom dev build (npx expo run:android / ios) because native WebRTC is not supported in Expo Go."
        );
      }

      if (!mod || !mod.StreamVideoClient) {
        throw new Error(
          "Stream Video SDK is unavailable. Please run via dev client (npx expo run:android / ios)."
        );
      }

      const { StreamVideoClient } = mod;

      // Get existing client instance
      const existingClient = StreamVideoClient.getOrCreateInstance({
        apiKey: process.env.EXPO_PUBLIC_STREAM_API_KEY!,
        user: { id: userId, name: userName },
        tokenProvider: async () => {
          const res = await fetch(getApiUrl("/stream-token"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, userName }),
          });
          const data = await res.json();
          return data.token as string;
        },
      });

      clientRef.current = existingClient;

      if (!mountedRef.current) return;
      setCallState("joining");

      // 3. Create and join the call
      const call = existingClient.call("default", callId, {
        reuseInstance: true,
      });
      callRef.current = call;

      await call.join({ create: true });

      if (!mountedRef.current) return;

      // 4. Disable camera (audio only)
      try {
        await call.camera.disable();
      } catch {
        // Camera may already be off
      }

      // 5. Enable microphone (request Android permission if needed)
      try {
        const hasMicPermission = await requestMicrophonePermission();
        if (hasMicPermission) {
          await call.microphone.enable();
        } else {
          console.warn("Microphone permission was not granted by user");
        }
      } catch (micErr) {
        console.warn("Microphone enable failed:", micErr);
      }

      if (!mountedRef.current) return;
      setCallState("joined");
      setIsMuted(false);
      setParticipantCount(1);

      // 6. Spawn AI teacher Vision Agent via server API route
      agentStateRef.current = "connecting";
      setAgentState("connecting");
      try {
        const agentStartRes = await fetch(getApiUrl("/agent-start"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId, callType: "default" }),
        });

        const agentData = await agentStartRes.json().catch(() => ({}));
        if (agentStartRes.ok && agentData.sessionId) {
          sessionIdRef.current = agentData.sessionId;
          if (mountedRef.current) {
            agentStateRef.current = "connected";
            setAgentState("connected");
            setParticipantCount((prev) => Math.max(prev, 2));
          }
        } else {
          console.warn(
            "Vision Agent start returned non-OK:",
            agentData.error || agentStartRes.status
          );
          if (mountedRef.current) {
            agentStateRef.current = "failed";
            setAgentState("failed");
          }
        }
      } catch (agentErr) {
        console.warn("Vision Agent connection failed:", agentErr);
        if (mountedRef.current) {
          agentStateRef.current = "failed";
          setAgentState("failed");
        }
      }

      // 7. Subscribe to participant count changes (RxJS Observables + coordinator events + periodic poll)
      const updateParticipants = () => {
        if (!mountedRef.current || !call || !call.state) return;
        try {
          const listCount = Array.isArray(call.state.participants)
            ? call.state.participants.length
            : 0;
          const sfuCount =
            typeof call.state.participantCount === "number"
              ? call.state.participantCount
              : 0;
          let count = Math.max(listCount, sfuCount, 1);
          if (agentStateRef.current === "connected" && count < 2) {
            count = 2;
          }
          setParticipantCount(count);
        } catch {
          // State may not be available yet
        }
      };

      updateParticipants();

      const subCount = call.state.participantCount$?.subscribe?.(
        (count: number) => {
          if (mountedRef.current && typeof count === "number") {
            const effective =
              agentStateRef.current === "connected"
                ? Math.max(count, 2)
                : Math.max(count, 1);
            setParticipantCount(effective);
          }
        }
      );

      const subParticipants = call.state.participants$?.subscribe?.(
        (participants: any[]) => {
          if (mountedRef.current && Array.isArray(participants)) {
            const effective =
              agentStateRef.current === "connected"
                ? Math.max(participants.length, 2)
                : Math.max(participants.length, 1);
            setParticipantCount(effective);
          }
        }
      );

      const unsubscribeJoined = call.on(
        "call.session_participant_joined",
        updateParticipants
      );

      const unsubscribeCount = call.on(
        "call.session_participant_count_updated",
        updateParticipants
      );

      const unsubscribeLeft = call.on(
        "call.session_participant_left",
        updateParticipants
      );

      const pollInterval = setInterval(updateParticipants, 1500);

      const unsubscribeEnded = call.on("call.ended", () => {
        if (mountedRef.current) {
          setCallState("ended");
          agentStateRef.current = "idle";
          setAgentState("idle");
          setParticipantCount(0);
        }
      });

      cleanupRef.current = () => {
        try {
          clearInterval(pollInterval);
          subCount?.unsubscribe?.();
          subParticipants?.unsubscribe?.();
          unsubscribeJoined?.();
          unsubscribeCount?.();
          unsubscribeLeft?.();
          unsubscribeEnded?.();
        } catch {
          // Swallow cleanup errors
        }
      };
    } catch (err) {
      console.error("Start call error:", err);
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to start audio call"
        );
        setCallState("error");
        agentStateRef.current = "failed";
        setAgentState("failed");
      }
    }
  }, [
    lessonId,
    userId,
    userName,
    lessonTitle,
    languageCode,
    languageName,
    goal,
    vocabulary,
    phrases,
    aiTeacherPrompt,
  ]);

  const endCall = useCallback(async () => {
    // 1. Clean up Vision Agent session
    if (callIdRef.current) {
      const activeCallId = callIdRef.current;
      const activeSessionId = sessionIdRef.current;
      callIdRef.current = null;
      sessionIdRef.current = null;

      try {
        await fetch(getApiUrl("/agent-stop"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId: activeCallId,
            sessionId: activeSessionId || undefined,
          }),
        });
      } catch (agentErr) {
        console.error("Agent stop error:", agentErr);
      }
    }

    agentStateRef.current = "idle";
    if (mountedRef.current) {
      setAgentState("idle");
    }

    // 2. Leave Stream call
    const call = callRef.current;
    if (!call) {
      setCallState("ended");
      return;
    }

    try {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const { CallingState } = await import(
        "@stream-io/video-react-native-sdk"
      );

      if (call.state.callingState !== CallingState.LEFT) {
        await call.leave();
      }
    } catch (err) {
      console.error("End call error:", err);
    } finally {
      callRef.current = null;
      if (mountedRef.current) {
        setCallState("ended");
        setIsMuted(false);
        setParticipantCount(0);
      }
    }
  }, []);

  const toggleMute = useCallback(async () => {
    const call = callRef.current;
    if (!call) return;

    try {
      if (isMuted) {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          if (mountedRef.current) {
            setError("Microphone permission is required to unmute.");
          }
          return;
        }
        await call.microphone.enable();
        if (mountedRef.current) {
          setIsMuted(false);
        }
      } else {
        await call.microphone.disable();
        if (mountedRef.current) {
          setIsMuted(true);
        }
      }
    } catch (err) {
      console.error("Toggle mute error:", err);
      if (mountedRef.current) {
        setError("Failed to toggle microphone. Please check permissions.");
      }
    }
  }, [isMuted]);

  return {
    callState,
    agentState,
    isMuted,
    error,
    participantCount,
    startCall,
    endCall,
    toggleMute,
  };
}

