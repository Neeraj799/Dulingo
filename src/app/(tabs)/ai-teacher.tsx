import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { images } from "@/constants/images";
import { isLessonQuizResolved } from "@/components/LessonDetailModal";
import { getLessonById, getLessonsByLanguage } from "@/data/lessons";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useProgressStore } from "@/store/useProgressStore";

export default function AITeacherScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    lessonId?: string;
    quizResolved?: string;
  }>();

  const selectedLanguageCode =
    useLanguageStore((s) => s.selectedLanguageCode) || "es";
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  // Fetch lesson data by ID or fallback to first available lesson for selected language
  const defaultLesson = getLessonsByLanguage(selectedLanguageCode)[0];
  const activeLesson = params.lessonId
    ? getLessonById(params.lessonId) || defaultLesson
    : defaultLesson;

  // Audio lesson controls interactive state
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);

  // Lesson phrases or fallback AI prompt opening phrase
  const phrases =
    activeLesson?.phrases && activeLesson.phrases.length > 0
      ? activeLesson.phrases
      : [
          {
            id: "default-1",
            phrase: "¡Muy bien!",
            translation: "That was great! 👏",
          },
          {
            id: "default-2",
            phrase: activeLesson?.aiTeacherPrompt?.openingMessage || "¡Hola! ¿Cómo estás?",
            translation: activeLesson?.aiTeacherPrompt?.openingMessage || "Hello! How are you?",
          },
        ];

  const currentPhrase = phrases[activePhraseIndex % phrases.length];

  const handlePlayPhraseAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = currentPhrase?.phrase;
      if (!textToSpeak) {
        setIsPlayingAudio(false);
        return;
      }
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
      setIsPlayingAudio(false);
    }
  };

  const handleNextPhrase = () => {
    setActivePhraseIndex((prev) => (prev + 1) % phrases.length);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/learn");
    }
  };

  const handleFinishSession = () => {
    const isResolved =
      params.quizResolved === "true" ||
      isLessonQuizResolved(activeLesson, null, completedLessonIds);

    if (activeLesson && isResolved) {
      completeLesson(activeLesson.id, activeLesson.xpReward || 15);
    }
    setShowEndCallModal(false);
    router.replace("/(tabs)/learn");
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
              <View className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <Text className="font-[Poppins-Medium] text-[12px] text-[#6B7280]">
                Online
              </Text>
            </View>
          </View>

          {/* Top Right Action Icons */}
          <View className="flex-row items-center gap-2">
            {/* Camera preview toggle button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setIsCameraOn((prev) => !prev)}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-white"
            >
              <Ionicons
                name={isCameraOn ? "videocam-outline" : "videocam-off-outline"}
                size={18}
                color="#0D132B"
              />
            </TouchableOpacity>

            {/* Session Phrase Progress Counter Pill */}
            <View className="px-2.5 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-white min-w-[40px]">
              <Text className="font-[Poppins-Bold] text-[12px] text-[#0D132B]">
                {activePhraseIndex + 1}/{phrases.length}
              </Text>
            </View>

            {/* User Profile Avatar Pill */}
            <TouchableOpacity
              activeOpacity={0.75}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-white"
            >
              <Ionicons name="person-outline" size={18} color="#0D132B" />
            </TouchableOpacity>
          </View>
        </View>

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

        {/* ── Main Stage Area (Mascot & Audio Stage) ─────────────────────── */}
        <View className="flex-1 bg-[#F5F2ED] rounded-[28px] overflow-hidden relative justify-between p-4 shadow-sm border border-[#EBE6DF]">

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
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleNextPhrase}
              className="mb-4 z-20"
            >
              <View className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100/80 relative">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="font-[Poppins-Bold] text-[17px] text-[#0D132B] leading-snug">
                      {currentPhrase?.phrase || "¡Muy bien!"}
                    </Text>
                    <Text className="font-[Poppins-Medium] text-[14px] text-[#4B5563] mt-1">
                      {currentPhrase?.translation || "That was great! 👏"}
                    </Text>
                  </View>

                  {/* Speaker Replay Audio Button */}
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={handlePlayPhraseAudio}
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
            </TouchableOpacity>
          )}

          {/* Audio Controls Row */}
          <View className="flex-row items-center justify-around pt-2 pb-1 z-20">
            {/* 1. Camera Toggle Button */}
            <View className="items-center gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsCameraOn((prev) => !prev)}
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

            {/* 2. Mic Toggle Button */}
            <View className="items-center gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsMicOn((prev) => !prev)}
                className={`w-14 h-14 rounded-full items-center justify-center shadow-md ${
                  isMicOn ? "bg-white border-2 border-[#5B42F3]" : "bg-slate-200"
                }`}
              >
                <Ionicons
                  name={isMicOn ? "mic" : "mic-off"}
                  size={24}
                  color={isMicOn ? "#5B42F3" : "#64748B"}
                />
              </TouchableOpacity>
              <Text className="font-[Poppins-Medium] text-[12px] text-[#4B5563]">
                Mic
              </Text>
            </View>

            {/* 3. Subtitles Toggle Button */}
            <View className="items-center gap-1.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowSubtitles((prev) => !prev)}
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
              You will complete this session and earn +{activeLesson?.xpReward || 15} XP!
            </Text>

            <View className="w-full gap-2.5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleFinishSession}
                className="w-full bg-[#5B42F3] py-3.5 rounded-2xl items-center justify-center shadow-sm"
              >
                <Text className="font-[Poppins-Bold] text-[16px] text-white">
                  Finish & Save XP
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowEndCallModal(false)}
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
});
