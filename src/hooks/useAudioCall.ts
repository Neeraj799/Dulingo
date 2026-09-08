import { useCallback, useEffect, useRef, useState } from "react";
import { NativeModules, PermissionsAndroid, Platform } from "react-native";
import { useAuth } from "@clerk/expo";
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

/**
 * Real-time live caption for speech in the audio lesson.
 */
export interface LiveCaption {
  id: string;
  speaker: "teacher" | "user";
  speakerName: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
}

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
  activeCaption: LiveCaption | null;
  captionHistory: LiveCaption[];
  captionsEnabled: boolean;
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  setMicrophoneActive: (active: boolean) => Promise<void>;
  toggleCaptions: (enabled?: boolean) => void;
  clearCaptions: () => void;
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
  const { getToken } = useAuth();
  const [callState, setCallState] = useState<AudioCallState>("idle");
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [activeCaption, setActiveCaption] = useState<LiveCaption | null>(null);
  const [captionHistory, setCaptionHistory] = useState<LiveCaption[]>([]);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);

  const callRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const callIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);
  const agentStateRef = useRef<AgentState>("idle");
  const sessionTokenRef = useRef<string | null>(null);
  const optionsRef = useRef(options);
  const isStartingRef = useRef(false);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Sync latest Clerk session token
  useEffect(() => {
    let cancelled = false;
    getToken().then((token) => {
      if (!cancelled && token) {
        sessionTokenRef.current = token;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    const token = (await getToken()) || sessionTokenRef.current;
    if (token) {
      sessionTokenRef.current = token;
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, [getToken]);

  // Cleanup on unmount: stop agent session & leave the call if still active
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      agentStateRef.current = "idle";

      // Release interval, subscriptions, and call listeners
      isStartingRef.current = false;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // 1. Clean up Vision Agent session on unmount
      if (callIdRef.current) {
        const activeCallId = callIdRef.current;
        const activeSessionId = sessionIdRef.current;
        const activeToken = sessionTokenRef.current;
        callIdRef.current = null;
        sessionIdRef.current = null;

        const stopHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (activeToken) {
          stopHeaders.Authorization = `Bearer ${activeToken}`;
        }

        fetch(getApiUrl("/agent-stop"), {
          method: "POST",
          headers: stopHeaders,
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
    // Prevent duplicate simultaneous call creations
    if (isStartingRef.current || callRef.current) {
      return;
    }
    isStartingRef.current = true;

    if (Platform.OS === "web" || !NativeModules?.WebRTCModule) {
      setError(
        "Stream calls require a custom dev build (npx expo run:android / ios) because native WebRTC is not supported in Expo Go."
      );
      setCallState("error");
      agentStateRef.current = "failed";
      setAgentState("failed");
      isStartingRef.current = false;
      return;
    }

    try {
      setCallState("loading");
      agentStateRef.current = "idle";
      setAgentState("idle");
      setError(null);

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
      } = optionsRef.current;

      // 1. Create call server-side with packed lesson context and unique session suffix
      const authHeader = await getAuthHeader();
      const sessionSuffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const safeUserId = (userId || "learner").replace(/[^a-zA-Z0-9_-]/g, "_").slice(-12);
      const callId = `lesson-${lessonId}-${safeUserId}-${sessionSuffix}`.replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );
      callIdRef.current = callId;

      const createRes = await fetch(getApiUrl("/stream-call"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        } as Record<string, string>,
        body: JSON.stringify({
          callId,
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
          let sessionToken = await getToken();
          if (!sessionToken && sessionTokenRef.current) {
            sessionToken = sessionTokenRef.current;
          }
          if (sessionToken) {
            sessionTokenRef.current = sessionToken;
          }
          const res = await fetch(getApiUrl("/stream-token"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(sessionToken
                ? { Authorization: `Bearer ${sessionToken}` }
                : {}),
            },
            body: JSON.stringify({ userName }),
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
        },
      });

      clientRef.current = existingClient;

      // Ensure location hint bypasses SFU edges experiencing regional outages/timeouts
      if (existingClient?.streamClient) {
        const origGetLocation = existingClient.streamClient.getLocationHint?.bind(
          existingClient.streamClient
        );
        existingClient.streamClient.getLocationHint = async (...args: any[]) => {
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

      if (!mountedRef.current) return;
      setCallState("joining");

      // 3. Create and join the call
      const call = existingClient.call("default", callId, {
        reuseInstance: true,
      });
      callRef.current = call;

      // Force coordinator to assign healthy SFU edge ('IAD' / US East) instead of broken Hyderabad edge
      if (typeof call.doJoinRequest === "function") {
        const origDoJoinRequest = call.doJoinRequest.bind(call);
        call.doJoinRequest = async (data: any) => {
          try {
            const request = { ...data, location: "IAD" };
            const joinResponse = await (call as any).streamClient.post(
              `${(call as any).streamClientBasePath}/join`,
              request
            );
            call.state.updateFromCallResponse(joinResponse.call);
            call.state.setMembers(joinResponse.members);
            call.state.setOwnCapabilities(joinResponse.own_capabilities);
            if (data?.ring) {
              (call as any).ringingSubject?.next(true);
            }
            if ((call as any).streamClient?._hasConnectionID?.()) {
              (call as any).watching = true;
              (call as any).clientStore?.registerOrUpdateCall(call);
            }
            console.log(
              "[useAudioCall] Coordinator assigned SFU edge:",
              joinResponse.credentials?.server?.edge_name
            );
            return joinResponse;
          } catch (joinReqErr) {
            console.warn(
              "[useAudioCall] Location override failed, falling back to default:",
              joinReqErr
            );
            return origDoJoinRequest(data);
          }
        };
      }

      await call.join({
        create: true,
        joinResponseTimeout: 20000,
        maxJoinRetries: 3,
      });

      if (!mountedRef.current) {
        call.leave().catch((err: unknown) =>
          console.error("Call leave on unmount error:", err)
        );
        callRef.current = null;
        return;
      }

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
        const agentAuthHeader = await getAuthHeader();
        const agentStartRes = await fetch(getApiUrl("/agent-start"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...agentAuthHeader,
          } as Record<string, string>,
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

      // Handle custom caption events from Vision Agent
      const handleCustomEvent = (event: any) => {
        if (!mountedRef.current) return;
        const custom = event?.custom || event?.data?.custom || event;
        if (
          custom &&
          (custom.type === "caption" || custom.speaker || custom.text)
        ) {
          const rawText =
            typeof custom.text === "string" ? custom.text.trim() : "";
          if (!rawText) return;

          const speaker: "teacher" | "user" =
            custom.speaker === "user" || custom.speaker_id === "learner"
              ? "user"
              : "teacher";
          const speakerName: string =
            custom.speakerName || (speaker === "teacher" ? "AI Teacher" : "You");
          const mode: string = custom.mode || "final";
          const isFinal = mode === "final";
          const id: string =
            custom.id ||
            `${speaker}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const timestamp = custom.timestamp
            ? Number(custom.timestamp) * 1000
            : Date.now();

          const captionItem: LiveCaption = {
            id,
            speaker,
            speakerName,
            text: rawText,
            isFinal,
            timestamp,
          };

          setActiveCaption(captionItem);
          if (isFinal) {
            setCaptionHistory((prev) => {
              const updated = [...prev, captionItem];
              return updated.length > 50 ? updated.slice(-50) : updated;
            });
          }
        }
      };

      const handleClosedCaption = (event: any) => {
        if (!mountedRef.current) return;
        const text =
          event?.text ||
          event?.closed_caption?.text ||
          event?.caption?.text ||
          "";
        if (!text || typeof text !== "string") return;

        const speakerId =
          event?.speaker_id || event?.closed_caption?.speaker_id || "";
        const isUser =
          speakerId === userId || speakerId === "learner" || speakerId === "user";

        const captionItem: LiveCaption = {
          id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          speaker: isUser ? "user" : "teacher",
          speakerName: isUser ? "You" : "AI Teacher",
          text: text.trim(),
          isFinal: true,
          timestamp: Date.now(),
        };

        setActiveCaption(captionItem);
        setCaptionHistory((prev) => {
          const updated = [...prev, captionItem];
          return updated.length > 50 ? updated.slice(-50) : updated;
        });
      };

      const unsubscribeCustom = call.on("custom", handleCustomEvent);
      const unsubscribeCC = call.on("call.closed_caption", handleClosedCaption);

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
          unsubscribeCustom?.();
          unsubscribeCC?.();
          unsubscribeEnded?.();
        } catch {
          // Swallow cleanup errors
        }
      };
    } catch (err) {
      console.error("Start call error:", err);
      if (callRef.current) {
        callRef.current.leave().catch(() => {});
        callRef.current = null;
      }
      if (mountedRef.current) {
        const isSfuTimeout =
          err instanceof Error &&
          (err.name === "SfuTimeoutError" ||
            err.message.includes("SFU WS connection failed") ||
            err.message.includes("timed out"));
        setError(
          isSfuTimeout
            ? "Connection to audio server timed out. Please check your internet connection or network firewall and retry."
            : err instanceof Error
            ? err.message
            : "Failed to start audio call"
        );
        setCallState("error");
        agentStateRef.current = "failed";
        setAgentState("failed");
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [getToken, getAuthHeader]);

  const endCall = useCallback(async () => {
    // 1. Clean up Vision Agent session
    if (callIdRef.current) {
      const activeCallId = callIdRef.current;
      const activeSessionId = sessionIdRef.current;
      callIdRef.current = null;
      sessionIdRef.current = null;

      try {
        const authHeader = await getAuthHeader();
        await fetch(getApiUrl("/agent-stop"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          } as Record<string, string>,
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
    isStartingRef.current = false;
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
  }, [getAuthHeader]);

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

  const setMicrophoneActive = useCallback(async (active: boolean) => {
    const call = callRef.current;
    if (!call) return;
    try {
      if (active) {
        const hasPerm = await requestMicrophonePermission();
        if (!hasPerm) return;
        await call.microphone.enable();
        if (mountedRef.current) setIsMuted(false);
      } else {
        await call.microphone.disable();
        if (mountedRef.current) setIsMuted(true);
      }
    } catch (err) {
      console.warn("setMicrophoneActive error:", err);
    }
  }, []);

  const toggleCaptions = useCallback((enabled?: boolean) => {
    setCaptionsEnabled((prev) => (typeof enabled === "boolean" ? enabled : !prev));
  }, []);

  const clearCaptions = useCallback(() => {
    setActiveCaption(null);
    setCaptionHistory([]);
  }, []);

  return {
    callState,
    agentState,
    isMuted,
    error,
    participantCount,
    activeCaption,
    captionHistory,
    captionsEnabled,
    startCall,
    endCall,
    toggleMute,
    setMicrophoneActive,
    toggleCaptions,
    clearCaptions,
  };
}

