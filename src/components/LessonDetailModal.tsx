import React, { useState } from "react";
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

export function LessonDetailModal({
  visible,
  lesson,
  unitTitle,
  onClose,
}: LessonDetailModalProps) {
  const router = useRouter();
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isJustCompleted, setIsJustCompleted] = useState(false);

  if (!lesson) return null;

  const isCompleted = completedLessonIds.includes(lesson.id);
  const activity = lesson.activities?.[0];

  const handleStartAudioLesson = () => {
    onClose();
    router.push({
      pathname: "/(tabs)/ai-teacher",
      params: { lessonId: lesson.id },
    });
  };

  const handleComplete = () => {
    completeLesson(lesson.id, lesson.xpReward);
    setIsJustCompleted(true);
    setTimeout(() => {
      setIsJustCompleted(false);
      onClose();
    }, 1200);
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
          <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-[#F3F4F6]">
            <View className="flex-1 pr-3">
              <Text className="font-[Poppins-Medium] text-[12px] text-[#6C5CE7] uppercase tracking-wider">
                {unitTitle || "Unit Lesson"} • Lesson {lesson.order}
              </Text>
              <Text className="font-[Poppins-Bold] text-[20px] text-[#0D132B] mt-0.5">
                {lesson.title}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-[#F3F4F6] items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Banner */}
            {isJustCompleted ? (
              <View className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-2xl p-4 mb-4 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-[#58CC02] items-center justify-center">
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-[Poppins-Bold] text-[16px] text-[#1B5E20]">
                    Lesson Completed! 🎉
                  </Text>
                  <Text className="font-[Poppins-Regular] text-[13px] text-[#2E7D32]">
                    +{lesson.xpReward} XP earned!
                  </Text>
                </View>
              </View>
            ) : isCompleted ? (
              <View className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-[#58CC02] items-center justify-center">
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </View>
                  <Text className="font-[Poppins-SemiBold] text-[14px] text-[#2E7D32]">
                    Completed Lesson
                  </Text>
                </View>
                <Text className="font-[Poppins-Bold] text-[14px] text-[#58CC02]">
                  +{lesson.xpReward} XP
                </Text>
              </View>
            ) : (
              <View className="bg-[#F4F2FD] border border-[#E0DAFB] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <Ionicons name="star" size={20} color="#6C5CE7" />
                  <Text className="font-[Poppins-Medium] text-[14px] text-[#4A3AFF]">
                    Goal: {lesson.goal?.description || lesson.description}
                  </Text>
                </View>
                <View className="bg-[#6C5CE7] px-2.5 py-1 rounded-full">
                  <Text className="font-[Poppins-Bold] text-[12px] text-white">
                    +{lesson.xpReward} XP
                  </Text>
                </View>
              </View>
            )}

            {/* Description */}
            <Text className="font-[Poppins-Regular] text-[14px] text-[#6B7280] mb-5 leading-relaxed">
              {lesson.description}
            </Text>

            {/* Vocabulary Items */}
            {lesson.vocabulary && lesson.vocabulary.length > 0 && (
              <View className="mb-5">
                <Text className="font-[Poppins-Bold] text-[16px] text-[#0D132B] mb-3">
                  Vocabulary Words
                </Text>
                <View className="gap-2.5">
                  {lesson.vocabulary.map((v) => (
                    <View
                      key={v.id}
                      className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-2xl p-3.5 flex-row items-center justify-between"
                    >
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-[Poppins-Bold] text-[16px] text-[#0D132B]">
                            {v.word}
                          </Text>
                          {v.pronunciation && (
                            <Text className="font-[Poppins-Regular] text-[12px] text-[#9CA3AF]">
                              [{v.pronunciation}]
                            </Text>
                          )}
                        </View>
                        {v.exampleSentence && (
                          <Text className="font-[Poppins-Regular] text-[13px] text-[#4B5563] mt-1">
                            &quot;{v.exampleSentence}&quot;
                          </Text>
                        )}
                      </View>
                      <Text className="font-[Poppins-SemiBold] text-[14px] text-[#6C5CE7]">
                        {v.translation}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Phrases */}
            {lesson.phrases && lesson.phrases.length > 0 && (
              <View className="mb-5">
                <Text className="font-[Poppins-Bold] text-[16px] text-[#0D132B] mb-3">
                  Key Phrases
                </Text>
                <View className="gap-2.5">
                  {lesson.phrases.map((p) => (
                    <View
                      key={p.id}
                      className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5"
                    >
                      <Text className="font-[Poppins-Bold] text-[15px] text-[#0F172A]">
                        {p.phrase}
                      </Text>
                      <Text className="font-[Poppins-Medium] text-[13px] text-[#3B82F6] mt-0.5">
                        {p.translation}
                      </Text>
                      {p.context && (
                        <Text className="font-[Poppins-Regular] text-[12px] text-[#94A3B8] mt-1">
                          💡 {p.context}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Interactive Activity Quiz */}
            {activity && activity.type === "multiple_choice" && (
              <View className="mb-6">
                <Text className="font-[Poppins-Bold] text-[16px] text-[#0D132B] mb-2">
                  Practice Exercise
                </Text>
                <Text className="font-[Poppins-Medium] text-[14px] text-[#374151] mb-3">
                  {activity.question}
                </Text>
                <View className="gap-2">
                  {activity.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.75}
                        onPress={() => setSelectedOption(opt)}
                        className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${
                          isSelected
                            ? "bg-[#EEF2FF] border-[#6C5CE7]"
                            : "bg-white border-[#E5E7EB]"
                        }`}
                      >
                        <Text
                          className={`font-[Poppins-Medium] text-[14px] ${
                            isSelected ? "text-[#6C5CE7]" : "text-[#1F2937]"
                          }`}
                        >
                          {opt}
                        </Text>
                        <View
                          className={`w-5 h-5 rounded-full border items-center justify-center ${
                            isSelected
                              ? "border-[#6C5CE7] bg-[#6C5CE7]"
                              : "border-[#D1D5DB]"
                          }`}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View className="px-6 py-4 border-t border-[#F3F4F6] bg-white gap-2.5">
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

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleComplete}
              className={`w-full py-3 rounded-2xl items-center justify-center ${
                isCompleted ? "bg-[#F3F4F6]" : "bg-[#F4F2FD]"
              }`}
            >
              <Text
                className={`font-[Poppins-SemiBold] text-[14px] ${
                  isCompleted ? "text-[#4B5563]" : "text-[#5B42F3]"
                }`}
              >
                {isCompleted ? "Mark Lesson Complete Again" : "Mark as Completed"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
