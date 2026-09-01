import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useProgressStore } from "@/store/useProgressStore";
import type { Lesson } from "@/types/learning";

interface LessonDetailModalProps {
  visible: boolean;
  lesson: Lesson | null;
  unitTitle?: string;
  onClose: () => void;
}

export function isLessonQuizResolved(
  lesson: Lesson | null | undefined,
  selectedOption?: string | null,
  completedLessonIds: string[] = []
): boolean {
  if (!lesson) return false;
  if (completedLessonIds.includes(lesson.id)) return true;

  const activity = lesson.activities?.[0];
  if (!activity || activity.type !== "multiple_choice") {
    return true;
  }

  const expectedAnswer = activity.answer ?? activity.correctAnswer;
  return Boolean(
    selectedOption !== undefined &&
      selectedOption !== null &&
      selectedOption === expectedAnswer
  );
}

function LessonDetailModalContent({
  visible,
  lesson,
  unitTitle,
  onClose,
}: LessonDetailModalProps & { lesson: Lesson }) {
  const router = useRouter();
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isJustCompleted, setIsJustCompleted] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!lesson) return null;

  const isCompleted = completedLessonIds.includes(lesson.id);
  const activity = lesson.activities?.[0];
  const expectedAnswer =
    activity && activity.type === "multiple_choice"
      ? activity.answer ?? activity.correctAnswer
      : null;

  const isQuizResolved = isLessonQuizResolved(
    lesson,
    selectedOption,
    completedLessonIds
  );

  const handlePlayAudio = (id: string, textToSpeak: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (playingAudioId === id) {
        setPlayingAudioId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lesson.languageCode || "es";
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      setPlayingAudioId(id);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => setPlayingAudioId(null), 1000);
    }
  };

  const handleStartAudioLesson = () => {
    onClose();
    router.push({
      pathname: "/(tabs)/ai-teacher",
      params: {
        lessonId: lesson.id,
      },
    });
  };

  const handleComplete = () => {
    if (!isQuizResolved) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const wasAlreadyCompleted = isCompleted;
    completeLesson(lesson.id, lesson.xpReward);

    if (!wasAlreadyCompleted) {
      setIsJustCompleted(true);

      timerRef.current = setTimeout(() => {
        setIsJustCompleted(false);
        onClose();
        timerRef.current = null;
      }, 1200);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Semi-transparent overlay */}
      <View style={styles.overlay}>
        <View className="bg-white rounded-t-3xl w-full max-h-[85%] overflow-hidden flex-col shadow-2xl">
          {/* Header Bar */}
          <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-[#F1F5F9]">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#E0E7FF]">
                  <Text className="font-[Poppins-Bold] text-[11px] text-[#6C5CE7] uppercase tracking-wide">
                    {unitTitle || "Unit Lesson"}
                  </Text>
                </View>
                <Text className="font-[Poppins-Medium] text-[12px] text-[#64748B]">
                  Lesson {lesson.order}
                </Text>
              </View>
              <Text className="font-[Poppins-Bold] text-[20px] text-[#0F172A] leading-tight">
                {lesson.title}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-[#F1F5F9] items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status / Goal Banner */}
            {isJustCompleted ? (
              <View className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-4 mb-4 flex-row items-center gap-3 shadow-xs">
                <View className="w-10 h-10 rounded-full bg-[#10B981] items-center justify-center">
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-[Poppins-Bold] text-[16px] text-[#065F46]">
                    Lesson Completed! 🎉
                  </Text>
                  <Text className="font-[Poppins-Medium] text-[13px] text-[#047857]">
                    +{lesson.xpReward} XP earned!
                  </Text>
                </View>
              </View>
            ) : isCompleted ? (
              <View className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-xs">
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-[#16A34A] items-center justify-center">
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </View>
                  <Text className="font-[Poppins-SemiBold] text-[14px] text-[#15803D]">
                    Completed Lesson
                  </Text>
                </View>
                <View className="bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#86EFAC]">
                  <Text className="font-[Poppins-Bold] text-[13px] text-[#166534]">
                    +{lesson.xpReward} XP
                  </Text>
                </View>
              </View>
            ) : (
              <View className="bg-[#F4F2FD] border border-[#E0DAFB] rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-xs">
                <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                  <View className="w-8 h-8 rounded-full bg-[#6C5CE7]/15 items-center justify-center">
                    <Ionicons name="star" size={18} color="#6C5CE7" />
                  </View>
                  <Text className="font-[Poppins-Medium] text-[13px] text-[#4338CA] flex-1">
                    Goal: {lesson.goal?.description || lesson.description}
                  </Text>
                </View>
                <View className="bg-[#6C5CE7] px-3 py-1 rounded-full shadow-xs">
                  <Text className="font-[Poppins-Bold] text-[12px] text-white">
                    +{lesson.xpReward} XP
                  </Text>
                </View>
              </View>
            )}

            {/* Description */}
            <Text className="font-[Poppins-Regular] text-[14px] text-[#475569] mb-5 leading-relaxed">
              {lesson.description}
            </Text>

            {/* Vocabulary Items */}
            {lesson.vocabulary && lesson.vocabulary.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="book-outline" size={18} color="#6C5CE7" />
                    <Text className="font-[Poppins-Bold] text-[16px] text-[#0F172A]">
                      Vocabulary Words
                    </Text>
                  </View>
                  <View className="bg-[#F1F5F9] px-2.5 py-0.5 rounded-full">
                    <Text className="font-[Poppins-Medium] text-[11px] text-[#64748B]">
                      {lesson.vocabulary.length} words
                    </Text>
                  </View>
                </View>

                <View className="gap-3">
                  {lesson.vocabulary.map((v) => {
                    const isPlaying = playingAudioId === v.id;

                    return (
                      <View
                        key={v.id}
                        className={`bg-white border-l-4 border-l-[#6C5CE7] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm ${
                          isPlaying ? "ring-2 ring-[#6C5CE7]/30 border-[#6C5CE7]" : ""
                        }`}
                      >
                        {/* Header: Word + Phonetic Pill + Speaker Button */}
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 pr-3">
                            <Text className="font-[Poppins-Bold] text-[18px] text-[#0F172A] tracking-wide">
                              {v.word}
                            </Text>

                            {v.pronunciation && (
                              <View className="self-start mt-1 bg-[#EEF2FF] border border-[#E0E7FF] px-2.5 py-0.5 rounded-full flex-row items-center gap-1">
                                <Ionicons name="volume-medium-outline" size={12} color="#6366F1" />
                                <Text className="font-[Poppins-Medium] text-[12px] text-[#4F46E5]">
                                  [{v.pronunciation}]
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Interactive Audio Button */}
                          <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() => handlePlayAudio(v.id, v.word)}
                            className={`w-9 h-9 rounded-full items-center justify-center border ${
                              isPlaying
                                ? "bg-[#5B42F3] border-[#5B42F3]"
                                : "bg-[#F4F2FD] border-[#E0DAFB]"
                            }`}
                          >
                            <Ionicons
                              name={isPlaying ? "volume-high" : "volume-medium"}
                              size={18}
                              color={isPlaying ? "#FFFFFF" : "#5B42F3"}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Translation Pill */}
                        <View className="mt-2.5 flex-row items-center">
                          <View className="bg-[#F0FDF4] border border-[#DCFCE7] px-3 py-1 rounded-xl flex-row items-center gap-1.5">
                            <Ionicons name="language" size={13} color="#16A34A" />
                            <Text className="font-[Poppins-SemiBold] text-[13px] text-[#15803D]">
                              {v.translation}
                            </Text>
                          </View>
                        </View>

                        {/* Example Sentence Box */}
                        {v.exampleSentence && (
                          <View className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3 mt-3 flex-row items-start gap-2">
                            <Ionicons name="chatbox-ellipses-outline" size={15} color="#94A3B8" style={{ marginTop: 2 }} />
                            <Text className="font-[Poppins-Medium] italic text-[13px] text-[#334155] flex-1 leading-snug">
                              &quot;{v.exampleSentence}&quot;
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Phrases */}
            {lesson.phrases && lesson.phrases.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="chatbubbles-outline" size={18} color="#3B82F6" />
                    <Text className="font-[Poppins-Bold] text-[16px] text-[#0F172A]">
                      Key Phrases
                    </Text>
                  </View>
                  <View className="bg-[#F1F5F9] px-2.5 py-0.5 rounded-full">
                    <Text className="font-[Poppins-Medium] text-[11px] text-[#64748B]">
                      {lesson.phrases.length} phrases
                    </Text>
                  </View>
                </View>

                <View className="gap-3">
                  {lesson.phrases.map((p) => {
                    const isPlaying = playingAudioId === p.id;

                    return (
                      <View
                        key={p.id}
                        className={`bg-white border-l-4 border-l-[#3B82F6] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm ${
                          isPlaying ? "ring-2 ring-[#3B82F6]/30 border-[#3B82F6]" : ""
                        }`}
                      >
                        {/* Header: Phrase + Audio */}
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 pr-3">
                            <Text className="font-[Poppins-Bold] text-[16px] text-[#0F172A] leading-snug">
                              {p.phrase}
                            </Text>
                          </View>

                          <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() => handlePlayAudio(p.id, p.phrase)}
                            className={`w-9 h-9 rounded-full items-center justify-center border ${
                              isPlaying
                                ? "bg-[#3B82F6] border-[#3B82F6]"
                                : "bg-[#EFF6FF] border-[#BFDBFE]"
                            }`}
                          >
                            <Ionicons
                              name={isPlaying ? "volume-high" : "volume-medium"}
                              size={18}
                              color={isPlaying ? "#FFFFFF" : "#2563EB"}
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Translation Badge */}
                        <View className="mt-2 flex-row items-center">
                          <View className="bg-[#EFF6FF] border border-[#DBEAFE] px-3 py-1 rounded-xl flex-row items-center gap-1.5">
                            <Ionicons name="sparkles-outline" size={13} color="#2563EB" />
                            <Text className="font-[Poppins-SemiBold] text-[13px] text-[#1D4ED8]">
                              {p.translation}
                            </Text>
                          </View>
                        </View>

                        {/* Context Hint */}
                        {p.context && (
                          <View className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-2.5 mt-2.5 flex-row items-center gap-2">
                            <Text className="text-[13px]">💡</Text>
                            <Text className="font-[Poppins-Regular] text-[12px] text-[#B45309] flex-1">
                              {p.context}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Interactive Activity Quiz */}
            {activity && activity.type === "multiple_choice" && (
              <View className="mb-6">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="fitness-outline" size={18} color="#58CC02" />
                  <Text className="font-[Poppins-Bold] text-[16px] text-[#0F172A]">
                    Practice Exercise
                  </Text>
                </View>
                <Text className="font-[Poppins-Medium] text-[14px] text-[#334155] mb-3 leading-relaxed">
                  {activity.question}
                </Text>
                <View className="gap-2.5">
                  {activity.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = isSelected && opt === expectedAnswer;

                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.75}
                        onPress={() => setSelectedOption(opt)}
                        className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                          isSelected
                            ? isCorrect
                              ? "bg-[#ECFDF5] border-[#10B981]"
                              : "bg-[#FEF2F2] border-[#EF4444]"
                            : "bg-white border-[#E2E8F0]"
                        }`}
                      >
                        <Text
                          className={`font-[Poppins-SemiBold] text-[14px] ${
                            isSelected
                              ? isCorrect
                                ? "text-[#065F46]"
                                : "text-[#991B1B]"
                              : "text-[#1E293B]"
                          }`}
                        >
                          {opt}
                        </Text>
                        <View
                          className={`w-6 h-6 rounded-full border flex-row items-center justify-center ${
                            isSelected
                              ? isCorrect
                                ? "border-[#10B981] bg-[#10B981]"
                                : "border-[#EF4444] bg-[#EF4444]"
                              : "border-[#CBD5E1]"
                          }`}
                        >
                          {isSelected && (
                            <Ionicons
                              name={isCorrect ? "checkmark" : "close"}
                              size={14}
                              color="#FFF"
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedOption && (
                  <View
                    className={`mt-3.5 p-3.5 rounded-2xl flex-row items-center gap-2.5 border ${
                      selectedOption === expectedAnswer
                        ? "bg-[#ECFDF5] border-[#A7F3D0]"
                        : "bg-[#FEF2F2] border-[#FCA5A5]"
                    }`}
                  >
                    <Ionicons
                      name={
                        selectedOption === expectedAnswer
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={22}
                      color={
                        selectedOption === expectedAnswer
                          ? "#059669"
                          : "#DC2626"
                      }
                    />
                    <Text
                      className={`font-[Poppins-Medium] text-[13px] flex-1 ${
                        selectedOption === expectedAnswer
                          ? "text-[#065F46]"
                          : "text-[#991B1B]"
                      }`}
                    >
                      {selectedOption === expectedAnswer
                        ? "Correct answer! Great job."
                        : "Incorrect choice. Try another answer!"}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View className="px-6 py-4 border-t border-[#F1F5F9] bg-white gap-2.5">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleStartAudioLesson}
              className="w-full py-3.5 bg-[#5B42F3] rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text className="font-[Poppins-Bold] text-[16px] text-white">
                Start AI Audio Lesson
              </Text>
            </TouchableOpacity>

            {(() => {
              const isQuizUnresolved = !isQuizResolved;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleComplete}
                  disabled={Boolean(isQuizUnresolved)}
                  className={`w-full py-3 rounded-2xl items-center justify-center ${
                    isCompleted
                      ? "bg-[#F1F5F9]"
                      : isQuizUnresolved
                      ? "bg-[#E2E8F0] opacity-60"
                      : "bg-[#F4F2FD]"
                  }`}
                >
                  <Text
                    className={`font-[Poppins-SemiBold] text-[14px] ${
                      isCompleted
                        ? "text-[#64748B]"
                        : isQuizUnresolved
                        ? "text-[#94A3B8]"
                        : "text-[#5B42F3]"
                    }`}
                  >
                    {isCompleted
                      ? "Mark Lesson Complete Again"
                      : "Mark as Completed"}
                  </Text>
                </TouchableOpacity>
              );
            })()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function LessonDetailModal({
  visible,
  lesson,
  unitTitle,
  onClose,
}: LessonDetailModalProps) {
  if (!visible || !lesson) return null;
  return (
    <LessonDetailModalContent
      key={lesson.id}
      visible={visible}
      lesson={lesson}
      unitTitle={unitTitle}
      onClose={onClose}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(13, 19, 43, 0.45)",
    justifyContent: "flex-end",
  },
  scrollView: {
    maxHeight: 480,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});

