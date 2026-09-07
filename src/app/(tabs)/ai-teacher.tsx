import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { images } from "@/constants/images";
import { getLessonById, getLessonsByLanguage } from "@/data/lessons";
import { getLanguageByCode } from "@/data/languages";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useAudioCall } from "@/hooks/useAudioCall";
import type { AgentState, AudioCallState } from "@/hooks/useAudioCall";

// Safe helpers for expo-speech to prevent crashes when native module is missing (e.g. in Expo Go / mock)
const safeSpeechStop = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Speech = require("expo-speech");
    if (Speech && typeof Speech.stop === "function") {
      Speech.stop();
    }
  } catch {
    // Native module missing
  }
};

const safeSpeechSpeak = (
  text: string,
  options: {
    language?: string;
    onDone?: () => void;
    onError?: () => void;
    onStopped?: () => void;
  }
): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Speech = require("expo-speech");
    if (Speech && typeof Speech.speak === "function") {
      Speech.speak(text, options);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export default function AITeacherScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lessonId?: string;
  }>();

  const { user } = useUser();

  const selectedLanguageCode =
    useLanguageStore((s) => s.selectedLanguageCode) || "es";
  const selectedLanguage = getLanguageByCode(selectedLanguageCode);
  const completeLesson = useProgressStore((s) => s.completeLesson);

  // Fetch lesson data by ID or fallback to first available lesson for selected language
  const defaultLesson = getLessonsByLanguage(selectedLanguageCode)[0];
  const activeLesson = params.lessonId
    ? getLessonById(params.lessonId) || defaultLesson
    : defaultLesson;

  // Audio lesson controls interactive state
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [visitedPhraseIndices, setVisitedPhraseIndices] = useState<Set<number>>(
    () => new Set([0])
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);

  // ── Stream Audio Call & Vision Agent Integration ─────────────────────
  const {
    callState,
    agentState,
    isMuted,
    error: callError,
    participantCount,
    startCall,
    endCall,
    toggleMute,
  } = useAudioCall({
    lessonId: activeLesson?.id || "unknown",
    languageCode: selectedLanguageCode,
    languageName: selectedLanguage?.name || selectedLanguageCode,
    lessonTitle: activeLesson?.title || "AI Audio Lesson",
    userId: user?.id || "anonymous",
    userName:
      user?.fullName ||
      user?.primaryEmailAddress?.emailAddress ||
      "Learner",
    goal: (activeLesson?.goal as unknown) as Record<string, unknown> | undefined,
    vocabulary: (activeLesson?.vocabulary as unknown) as Record<string, unknown>[] | undefined,
    phrases: (activeLesson?.phrases as unknown) as Record<string, unknown>[] | undefined,
    aiTeacherPrompt: (activeLesson?.aiTeacherPrompt as unknown) as Record<string, unknown> | undefined,
  });

  // Lesson phrases or fallback AI prompt opening phrase
  const phrases =
    activeLesson?.phrases && activeLesson.phrases.length > 0
      ? activeLesson.phrases
      : [
          {
            id: "default-1",
            phrase: activeLesson?.aiTeacherPrompt?.openingMessage || "¡Hola! ¿Cómo estás?",
            translation: "Hello! How are you?",
          },
          {
            id: "default-2",
            phrase: "¡Muy bien!",
            translation: "That was great! 👏",
          },
        ];

  const currentPhrase = phrases[activePhraseIndex % phrases.length];

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      safeSpeechStop();
      setIsPlayingAudio(false);
    };
  }, []);

  const handlePlayPhraseAudio = () => {
    const textToSpeak = currentPhrase?.phrase;
    if (!textToSpeak) {
      setIsPlayingAudio(false);
      return;
    }

    if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedLanguageCode;
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(true);
      safeSpeechStop();

      const spoken = safeSpeechSpeak(textToSpeak, {
        language: selectedLanguageCode,
        onDone: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
        onStopped: () => setIsPlayingAudio(false),
      });

      // Fallback timer if native speech module wasn't available
      if (!spoken) {
        setTimeout(() => setIsPlayingAudio(false), 1200);
      }
    }
  };

  const handleNextPhrase = () => {
    setActivePhraseIndex((prev) => {
      const nextIndex = (prev + 1) % phrases.length;
      setVisitedPhraseIndices((visited) => new Set(visited).add(nextIndex));
      return nextIndex;
    });
  };

  const handleBack = () => {
    if (callState === "joined" || callState === "joining") {
      setShowEndCallModal(true);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/learn");
    }
  };

  const isSessionComplete =
    phrases.length > 0 && visitedPhraseIndices.size >= phrases.length;

  const handleFinishSession = async () => {
    if (activeLesson && isSessionComplete) {
      completeLesson(activeLesson.id, activeLesson.xpReward || 15);
    }

    // End the Stream call and clean up agent session if active
    if (callState === "joined" || callState === "joining") {
      await endCall();
    }

    setShowEndCallModal(false);
    router.replace("/(tabs)/learn");
  };

  // ── Call Status Banner Helper ──────────────────────────────────────────
  const renderCallStatusBanner = () => {
    const bannerConfig = getCallBannerConfig(callState, agentState, callError, participantCount);
    if (!bannerConfig) return null;

    return (
      <View
        className={`flex-row items-center gap-2 px-3.5 py-2 rounded-xl mb-2 ${bannerConfig.bgClass}`}
      >
        {bannerConfig.showSpinner ? (
          <ActivityIndicator size="small" color={bannerConfig.spinnerColor} />
        ) : (
          <View className={`w-2.5 h-2.5 rounded-full ${bannerConfig.dotClass}`} />
        )}
        <Text className={`font-[Poppins-Medium] text-[12px] flex-1 ${bannerConfig.textClass}`}>
          {bannerConfig.text}
        </Text>
        {bannerConfig.showRetry && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={startCall}
            className="bg-white/20 px-2.5 py-1 rounded-full"
          >
            <Text className="font-[Poppins-SemiBold] text-[11px] text-white">
              Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View className="flex-1 bg-white px-5 pt-2 pb-3">
        {/* ── Top Header Navigation & Status Bar ────────────────────────────── */}
        <View className="flex-row items-center justify-between pb-3 z-10">
          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="w-10 h-10 rounded-full items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={26} color="#0D132B" />
          </TouchableOpacity>

          {/* AI Teacher Title & Online Status */}
          <View className="flex-1 ml-2">
            <Text className="font-[Poppins-Bold] text-[18px] text-[#0D132B]">
              AI Teacher
            </Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <View
                className={`w-2.5 h-2.5 rounded-full ${
                  callState === "joined" && agentState === "connected"
                    ? "bg-[#22C55E]"
                    : agentState === "connecting" || callState === "joining" || callState === "loading"
                    ? "bg-[#F59E0B]"
                    : agentState === "failed" || callState === "error"
                    ? "bg-[#EF4444]"
                    : "bg-[#9CA3AF]"
                }`}
              />
              <Text className="font-[Poppins-Medium] text-[12px] text-[#6B7280]">
                {callState === "joined" && agentState === "connected"
                  ? "AI Teacher Connected"
                  : agentState === "connecting"
                  ? "Connecting AI Teacher..."
                  : agentState === "failed"
                  ? "Agent Connection Failed"
                  : callState === "joining" || callState === "loading"
                  ? "Connecting..."
                  : "Online"}
              </Text>
            </View>
          </View>

          {/* Top Right Action Icons */}
          <View className="flex-row items-center gap-2">
            {/* Camera preview toggle button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setIsCameraOn((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel={isCameraOn ? "Turn camera off" : "Turn camera on"}
              accessibilityState={{ checked: isCameraOn, selected: isCameraOn }}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-white"
            >
              <Ionicons
                name={isCameraOn ? "videocam-outline" : "videocam-off-outline"}
                size={18}
                color="#0D132B"
              />
            </TouchableOpacity>

            {/* Call Participant Count Pill */}
            <View
              accessibilityRole="text"
              accessibilityLabel={`Call participants: ${callState === "joined" ? participantCount : 1} of 2`}
              className="flex-row items-center gap-1.5 px-2.5 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-white min-w-[48px]"
            >
              <Ionicons
                name="people"
                size={14}
                color={
                  callState === "joined" && participantCount >= 2
                    ? "#22C55E"
                    : callState === "joined"
                    ? "#3B82F6"
                    : "#6B7280"
                }
              />
              <Text className="font-[Poppins-Bold] text-[12px] text-[#0D132B]">
                {callState === "joined"
                  ? `${participantCount}/2`
                  : callState === "ended"
                  ? "0/2"
                  : "1/2"}
              </Text>
            </View>

            {/* User Profile Avatar Pill */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push("/(tabs)/profile")}
              accessibilityRole="button"
              accessibilityLabel="Go to profile"
              className="w-10 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-white"
            >
              <Ionicons name="person-outline" size={18} color="#0D132B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Call Status Banner ──────────────────────────────────────────── */}
        {renderCallStatusBanner()}

        {/* ── Lesson Title / Goal Banner ──────────────────────────────────── */}
        <View className="bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-2 rounded-xl mb-3 flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <Text
              numberOfLines={1}
              className="font-[Poppins-SemiBold] text-[13px] text-[#0D132B]"
            >
              {activeLesson?.title || "AI Audio Lesson"}
            </Text>
            <Text
              numberOfLines={1}
              className="font-[Poppins-Regular] text-[11px] text-[#64748B]"
            >
              {activeLesson?.goal?.description || "Interactive audio conversation practice"}
            </Text>
          </View>
          <View className="bg-[#6C5CE7] px-2 py-0.5 rounded-full">
            <Text className="font-[Poppins-Bold] text-[11px] text-white">
              +{activeLesson?.xpReward || 15} XP
            </Text>
          </View>
        </View>

        {/* ── User Info Card (when signed in) ─────────────────────────────── */}
        {user && callState === "joined" && (
          <View className="bg-[#EEF2FF] border border-[#E0E7FF] px-3.5 py-2 rounded-xl mb-3 flex-row items-center gap-2.5">
            <View className="w-8 h-8 rounded-full bg-[#6C5CE7] items-center justify-center">
              <Text className="font-[Poppins-Bold] text-[13px] text-white">
                {(user.fullName || user.primaryEmailAddress?.emailAddress || "L")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-[Poppins-SemiBold] text-[12px] text-[#4338CA]">
                {user.fullName || user.primaryEmailAddress?.emailAddress || "Learner"}
              </Text>
              <Text className="font-[Poppins-Regular] text-[10px] text-[#6366F1]">
                {isMuted ? "🔇 Muted" : "🎙 Speaking"} · Agent: {agentState} · {participantCount}{" "}
                {participantCount === 1 ? "participant" : "participants"}
              </Text>
            </View>
          </View>
        )}

        {/* ── Main Stage Area (Mascot & Audio Stage) ─────────────────────── */}
        <View className="flex-1 bg-[#F5F2ED] rounded-[28px] overflow-hidden relative justify-between p-4 shadow-sm border border-[#EBE6DF]">

          {/* Start Call Overlay (shown when call is idle or ended) */}
          {(callState === "idle" || callState === "ended") && Platform.OS !== "web" && (
            <View style={styles.startCallOverlay}>
              <View className="bg-white rounded-3xl p-6 items-center shadow-xl mx-4">
                <View className="w-16 h-16 rounded-full bg-[#EEF2FF] items-center justify-center mb-3">
                  <Ionicons name="headset-outline" size={32} color="#5B42F3" />
                </View>
                <Text className="font-[Poppins-Bold] text-[18px] text-[#0D132B] text-center mb-1">
                  {callState === "ended" ? "Audio Session Ended" : "Start Audio Session"}
                </Text>
                <Text className="font-[Poppins-Regular] text-[13px] text-[#6B7280] text-center mb-4">
                  {callState === "ended"
                    ? "Reconnect to resume your live conversation with AI Teacher"
                    : "Connect to a live audio call with AI Teacher for this lesson"}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={startCall}
                  className="bg-[#5B42F3] px-8 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-sm"
                >
                  <Ionicons
                    name={callState === "ended" ? "refresh-outline" : "call-outline"}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text className="font-[Poppins-Bold] text-[15px] text-white">
                    {callState === "ended" ? "Reconnect Call" : "Start Call"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Connecting Overlay */}
          {(callState === "loading" || callState === "joining") && (
            <View style={styles.startCallOverlay}>
              <View className="bg-white rounded-3xl p-6 items-center shadow-xl mx-4">
                <ActivityIndicator size="large" color="#5B42F3" />
                <Text className="font-[Poppins-SemiBold] text-[16px] text-[#0D132B] mt-3">
                  {callState === "loading" ? "Setting up call..." : "Joining audio call..."}
                </Text>
                <Text className="font-[Poppins-Regular] text-[13px] text-[#6B7280] mt-1">
                  Please wait while we connect you to Stream
                </Text>
              </View>
            </View>
          )}

          {/* Centered Mascot Character Graphic */}
          <View className="flex-1 items-center justify-center pt-6">
            <Image
              source={images.mascotWelcome}
              style={styles.mascotImage}
              contentFit="contain"
            />
          </View>

          {/* Teacher Response Speech Bubble */}
          {showSubtitles && (
            <View className="mb-4 z-20">
              <View className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100/80 relative">
                {/* Phrase index header */}
                <View className="flex-row items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                  <Text className="font-[Poppins-SemiBold] text-[11px] text-[#5B42F3] uppercase tracking-wider">
                    Phrase {activePhraseIndex + 1} of {phrases.length}
                  </Text>
                  <Text className="font-[Poppins-Regular] text-[10px] text-[#94A3B8]">
                    Tap text to next
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleNextPhrase}
                    accessibilityRole="button"
                    accessibilityLabel="Next phrase"
                    className="flex-1 pr-3"
                  >
                    <Text className="font-[Poppins-Bold] text-[17px] text-[#0D132B] leading-snug">
                      {currentPhrase?.phrase || "¡Muy bien!"}
                    </Text>
                    <Text className="font-[Poppins-Medium] text-[14px] text-[#4B5563] mt-1">
                      {currentPhrase?.translation || "That was great! 👏"}
                    </Text>
                  </TouchableOpacity>

                  {/* Speaker Replay Audio Button */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handlePlayPhraseAudio}
                    accessibilityRole="button"
                    accessibilityLabel={isPlayingAudio ? "Audio playing" : "Play phrase audio"}
                    accessibilityState={{ checked: isPlayingAudio, selected: isPlayingAudio }}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isPlayingAudio ? "bg-[#5B42F3]" : "bg-[#F4F2FD]"
                    }`}
                  >
                    <Ionicons
                      name={isPlayingAudio ? "volume-high" : "volume-medium"}
                      size={22}
                      color={isPlayingAudio ? "#FFFFFF" : "#5B42F3"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Bottom Arrow Pointer */}
                <View style={styles.speechBubblePointer} />
              </View>
            </View>
          )}

          {/* Audio Controls Row */}
          <View className="flex-row items-center justify-around pt-2 pb-1 z-20">
            {/* 1. Camera Toggle Button */}
            <View className="items-center gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsCameraOn((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={isCameraOn ? "Turn camera off" : "Turn camera on"}
                accessibilityState={{ checked: isCameraOn, selected: isCameraOn }}
                className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${
                  isCameraOn ? "bg-white" : "bg-slate-200"
                }`}
              >
                <Ionicons
                  name={isCameraOn ? "videocam" : "videocam-off"}
                  size={24}
                  color={isCameraOn ? "#0D132B" : "#64748B"}
                />
              </TouchableOpacity>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#4B5563]">
                Camera
              </Text>
            </View>

            {/* 2. Mic Toggle Button — wired to Stream call when joined */}
            <View className="items-center gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={callState === "joined" ? toggleMute : undefined}
                accessibilityRole="button"
                accessibilityLabel={isMuted ? "Unmute microphone" : "Mute microphone"}
                accessibilityState={{ checked: !isMuted, selected: !isMuted }}
                className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${
                  !isMuted
                    ? "bg-white border-2 border-[#5B42F3]"
                    : "bg-slate-200"
                }`}
              >
                <Ionicons
                  name={!isMuted ? "mic" : "mic-off"}
                  size={24}
                  color={!isMuted ? "#5B42F3" : "#64748B"}
                />
              </TouchableOpacity>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#4B5563]">
                {isMuted ? "Unmute" : "Mic"}
              </Text>
            </View>

            {/* 3. Subtitles Toggle Button */}
            <View className="items-center gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowSubtitles((prev) => !prev)}
                accessibilityRole="button"
                accessibilityLabel={showSubtitles ? "Hide subtitles" : "Show subtitles"}
                accessibilityState={{ checked: showSubtitles, selected: showSubtitles }}
                className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${
                  showSubtitles ? "bg-[#FFFFFF] border-2 border-[#5B42F3]" : "bg-slate-200"
                }`}
              >
                <Ionicons
                  name="language-outline"
                  size={24}
                  color={showSubtitles ? "#5B42F3" : "#64748B"}
                />
              </TouchableOpacity>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#4B5563]">
                Subtitles
              </Text>
            </View>

            {/* 4. End Call Button */}
            <View className="items-center gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowEndCallModal(true)}
                accessibilityRole="button"
                accessibilityLabel="End call"
                className="w-14 h-14 rounded-full bg-[#FF4D4D] items-center justify-center shadow-md"
              >
                <Ionicons name="call" size={24} color="#FFFFFF" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#4B5563]">
                End Call
              </Text>
            </View>
          </View>
        </View>

        {/* ── Session Feedback Metrics Card (Preview) ─────────────────────── */}
        <View className="mt-3.5 bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-sm">
          <View className="flex-row items-center justify-between mb-2 pb-1.5 border-b border-[#F3F4F6]">
            <Text className="font-[Poppins-SemiBold] text-[12px] text-[#6B7280]">
              Session Feedback
            </Text>
            <View className="bg-[#F3F4F6] px-2 py-0.5 rounded-full">
              <Text className="font-[Poppins-Medium] text-[10px] text-[#6B7280]">
                PREVIEW
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            {/* Column 1: Speaking */}
            <View className="flex-1 items-center justify-center border-r border-[#F3F4F6] pr-2">
              <Text className="font-[Poppins-Bold] text-[12px] text-[#0D132B]">
                Speaking
              </Text>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#9CA3AF] mt-0.5">
                Preview
              </Text>
            </View>

            {/* Column 2: Pronunciation */}
            <View className="flex-1 items-center justify-center border-r border-[#F3F4F6] px-2">
              <Text className="font-[Poppins-Bold] text-[12px] text-[#0D132B]">
                Pronunciation
              </Text>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#9CA3AF] mt-0.5">
                Preview
              </Text>
            </View>

            {/* Column 3: Grammar */}
            <View className="flex-1 items-center justify-center pl-2">
              <Text className="font-[Poppins-Bold] text-[12px] text-[#0D132B]">
                Grammar
              </Text>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#9CA3AF] mt-0.5">
                Preview
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── End Call Confirmation Modal ────────────────────────────────────── */}
      <Modal
        visible={showEndCallModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndCallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-3xl p-6 mx-6 w-[88%] items-center shadow-2xl">
            <View className="w-14 h-14 rounded-full bg-[#EEF2FF] items-center justify-center mb-3">
              <Ionicons name="sparkles" size={28} color="#5B42F3" />
            </View>

            <Text className="font-[Poppins-Bold] text-[20px] text-[#0D132B] text-center">
              End AI Audio Session?
            </Text>

            <Text className="font-[Poppins-Regular] text-[14px] text-[#6B7280] text-center mt-1.5 mb-6">
              {isSessionComplete
                ? `You will complete this session and earn +${activeLesson?.xpReward || 15} XP!`
                : "You will complete this session without earning XP."}
            </Text>

            <View className="w-full gap-2.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleFinishSession}
                accessibilityRole="button"
                accessibilityLabel={isSessionComplete ? "Finish and save XP" : "Finish session"}
                className="w-full bg-[#5B42F3] py-3.5 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="font-[Poppins-Bold] text-[16px] text-white">
                  {isSessionComplete ? "Finish & Save XP" : "Finish Session"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowEndCallModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Continue lesson"
                className="w-full py-3 rounded-2xl items-center justify-center"
              >
                <Text className="font-[Poppins-Medium] text-[14px] text-[#6B7280]">
                  Continue Lesson
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Helper: Call Status Banner Config ─────────────────────────────────────
function getCallBannerConfig(
  callState: AudioCallState,
  agentState: AgentState,
  callError: string | null,
  participantCount: number
) {
  if (callState === "loading") {
    return {
      bgClass: "bg-[#FFF7ED] border border-[#FED7AA]",
      dotClass: "",
      textClass: "text-[#C2410C]",
      text: "Setting up audio call...",
      showSpinner: true,
      spinnerColor: "#EA580C",
      showRetry: false,
    };
  }

  if (callState === "joining") {
    return {
      bgClass: "bg-[#EFF6FF] border border-[#BFDBFE]",
      dotClass: "",
      textClass: "text-[#1D4ED8]",
      text: "Joining audio session...",
      showSpinner: true,
      spinnerColor: "#2563EB",
      showRetry: false,
    };
  }

  if (callState === "error") {
    return {
      bgClass: "bg-[#FEF2F2] border border-[#FECACA]",
      dotClass: "bg-[#EF4444]",
      textClass: "text-[#991B1B]",
      text: callError || "Connection failed",
      showSpinner: false,
      spinnerColor: "",
      showRetry: true,
    };
  }

  if (callState === "ended") {
    return {
      bgClass: "bg-[#F1F5F9] border border-[#E2E8F0]",
      dotClass: "bg-[#94A3B8]",
      textClass: "text-[#475569]",
      text: "Audio session ended",
      showSpinner: false,
      spinnerColor: "",
      showRetry: true,
    };
  }

  if (callState === "joined") {
    if (agentState === "connecting") {
      return {
        bgClass: "bg-[#EFF6FF] border border-[#BFDBFE]",
        dotClass: "",
        textClass: "text-[#1D4ED8]",
        text: "Connecting AI Teacher Agent...",
        showSpinner: true,
        spinnerColor: "#2563EB",
        showRetry: false,
      };
    }

    if (agentState === "connected") {
      return {
        bgClass: "bg-[#F0FDF4] border border-[#BBF7D0]",
        dotClass: "bg-[#22C55E]",
        textClass: "text-[#15803D]",
        text: `Connected · AI Teacher Live (${participantCount}/2 participants)`,
        showSpinner: false,
        spinnerColor: "",
        showRetry: false,
      };
    }

    if (agentState === "failed") {
      return {
        bgClass: "bg-[#FEF2F2] border border-[#FECACA]",
        dotClass: "bg-[#EF4444]",
        textClass: "text-[#991B1B]",
        text: "AI Teacher connection failed",
        showSpinner: false,
        spinnerColor: "",
        showRetry: true,
      };
    }

    return {
      bgClass: "bg-[#F0FDF4] border border-[#BBF7D0]",
      dotClass: "bg-[#22C55E]",
      textClass: "text-[#15803D]",
      text: `Connected · ${participantCount}/2 participants`,
      showSpinner: false,
      spinnerColor: "",
      showRetry: false,
    };
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mascotImage: {
    width: 220,
    height: 220,
  },
  speechBubblePointer: {
    position: "absolute",
    bottom: -8,
    left: 40,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13, 19, 43, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  startCallOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(245, 242, 237, 0.92)",
    zIndex: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});

