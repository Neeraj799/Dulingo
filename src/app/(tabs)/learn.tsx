import React, { useState } from "react";
import {
  ScrollView,
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
import { getActiveUnitForLanguage, getUnitsByLanguage } from "@/data/units";
import { getLessonsByUnit } from "@/data/lessons";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useProgressStore } from "@/store/useProgressStore";
import { LessonDetailModal } from "@/components/LessonDetailModal";
import type { Lesson, Unit } from "@/types/learning";

// Map lesson topic or index to topic image asset or fallback placeholder
const getLessonTopicImage = (lessonTitle: string, index: number) => {
  const titleLower = lessonTitle.toLowerCase();
  if (titleLower.includes("café") || titleLower.includes("cafe")) {
    return images.lessonCafeIcon;
  }
  if (titleLower.includes("greeting") || titleLower.includes("basico")) {
    return images.mascotWelcome;
  }
  if (titleLower.includes("travel") || titleLower.includes("direction")) {
    return images.earth;
  }
  if (titleLower.includes("shopping") || titleLower.includes("food")) {
    return images.treasure;
  }
  if (titleLower.includes("family") || titleLower.includes("friend")) {
    return images.palace;
  }
  // Fallbacks
  const fallbacks = [
    images.lessonCafeIcon,
    images.mascotWelcome,
    images.earth,
    images.treasure,
    images.palace,
  ];
  return fallbacks[index % fallbacks.length];
};

export default function LearnScreen() {
  const router = useRouter();
  const { unitId } = useLocalSearchParams<{ unitId?: string }>();

  const selectedLanguageCode = useLanguageStore((s) => s.selectedLanguageCode) || "es";
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  const [activeTab, setActiveTab] = useState<"lessons" | "practice">("lessons");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Get units for current language
  const languageUnits = getUnitsByLanguage(selectedLanguageCode);
  
  // Pick active unit from navigation params or active-unit selection function
  const activeUnit: Unit =
    (unitId ? languageUnits.find((u) => u.id === unitId) : undefined) ||
    getActiveUnitForLanguage(selectedLanguageCode, completedLessonIds);

  // Get lessons for active unit
  const unitLessons = getLessonsByUnit(activeUnit.id);

  // Completed lessons count in this unit
  const completedCountInUnit = unitLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;

  // In-progress lesson is the first uncompleted lesson, or default to Lesson 3 if all/none completed
  const firstUncompletedIndex = unitLessons.findIndex(
    (l) => !completedLessonIds.includes(l.id)
  );

  const inProgressIndex =
    firstUncompletedIndex !== -1 ? firstUncompletedIndex : 2;

  const handleLessonPress = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View className="flex-1 bg-white">
        {/* ── Top Header Navigation Bar ───────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-3 bg-white z-10">
          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            className="w-10 h-10 rounded-full items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={26} color="#0D132B" />
          </TouchableOpacity>

          {/* Unit Title & Progress Subtitle */}
          <View className="items-center justify-center flex-1 mx-2">
            <Text
              numberOfLines={1}
              className="font-[Poppins-Bold] text-[18px] text-[#0D132B] text-center"
            >
              {activeUnit.title}
            </Text>
            <Text className="font-[Poppins-Medium] text-[13px] text-[#6B7280] text-center mt-0.5">
              Unit {activeUnit.order} • {completedCountInUnit} / {unitLessons.length} lessons
            </Text>
          </View>

          {/* Bookmark / Guidebook Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsBookmarked((prev) => !prev)}
            className={`w-9 h-10 rounded-xl items-center justify-center border ${
              isBookmarked
                ? "bg-[#5B42F3] border-[#5B42F3]"
                : "bg-[#F4F2FD] border-[#E0DAFB]"
            }`}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? "#FFFFFF" : "#5B42F3"}
            />
          </TouchableOpacity>
        </View>

        {/* ── Main Scroll View ───────────────────────────────────────────── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header Banner Illustration Graphic ─────────────────────────── */}
          <View className="relative w-full h-[180px] bg-[#F7F5FF] overflow-hidden rounded-b-3xl">
            <Image
              source={images.lessonCafeBanner || images.mascotWelcome}
              style={styles.bannerImage}
              contentFit="cover"
            />
          </View>

          {/* ── Segmented Control / Tabs Switcher ──────────────────────────── */}
          <View className="mx-5 -mt-6 bg-[#F3F1FD] p-1.5 rounded-2xl flex-row items-center shadow-sm z-20 border border-[#EBE7FD]">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveTab("lessons")}
              className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                activeTab === "lessons"
                  ? "bg-white shadow-sm border border-indigo-50/60"
                  : ""
              }`}
            >
              <Text
                className={`font-[Poppins-Bold] text-[15px] ${
                  activeTab === "lessons" ? "text-[#5B42F3]" : "text-[#6B7280]"
                }`}
              >
                Lessons
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setActiveTab("practice")}
              className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                activeTab === "practice"
                  ? "bg-white shadow-sm border border-indigo-50/60"
                  : ""
              }`}
            >
              <Text
                className={`font-[Poppins-Bold] text-[15px] ${
                  activeTab === "practice" ? "text-[#5B42F3]" : "text-[#6B7280]"
                }`}
              >
                Practice
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Tab Content ──────────────────────────────────────────────── */}
          {activeTab === "lessons" ? (
            /* ── Lessons List ───────────────────────────────────────────── */
            <View className="px-5 pt-4 pb-12 gap-3">
              {unitLessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isInProgress = !isCompleted && index === inProgressIndex;
                const topicImage = getLessonTopicImage(lesson.title, index);

                if (isCompleted) {
                  // ── COMPLETED LESSON CARD ──────────────────────────────
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      activeOpacity={0.8}
                      onPress={() => handleLessonPress(lesson)}
                      className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex-row items-center justify-between shadow-none"
                    >
                      <View className="flex-1 pr-3">
                        <Text className="font-[Poppins-Medium] text-[13px] text-[#9CA3AF]">
                          Lesson {index + 1}
                        </Text>
                        <Text className="font-[Poppins-SemiBold] text-[16px] text-[#0D132B] mt-0.5">
                          {lesson.title}
                        </Text>
                      </View>

                      {/* Completed Green Checkmark Circle */}
                      <View className="w-7 h-7 rounded-full bg-[#58CC02] items-center justify-center">
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  );
                }

                if (isInProgress) {
                  // ── IN PROGRESS LESSON CARD (MATCHES DESIGN EXACTLY) ─────
                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      activeOpacity={0.85}
                      onPress={() => handleLessonPress(lesson)}
                      className="bg-[#F7F5FF] border-2 border-[#5B42F3] rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
                    >
                      <View className="flex-1 pr-3">
                        <Text className="font-[Poppins-Bold] text-[13px] text-[#5B42F3]">
                          Lesson {index + 1}
                        </Text>
                        <Text className="font-[Poppins-Bold] text-[17px] text-[#0D132B] mt-0.5">
                          {lesson.title}
                        </Text>
                        <Text className="font-[Poppins-Medium] text-[13px] text-[#5B42F3] mt-1">
                          In progress
                        </Text>
                      </View>

                      {/* Topic Illustration / Icon Graphic on Right */}
                      <View className="w-16 h-16 rounded-xl overflow-hidden bg-white/70 items-center justify-center">
                        <Image
                          source={topicImage}
                          style={styles.cardTopicImage}
                          contentFit="contain"
                        />
                      </View>
                    </TouchableOpacity>
                  );
                }

                // ── UPCOMING / AVAILABLE LESSON CARD ────────────────────
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    activeOpacity={0.8}
                    disabled={true}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex-row items-center justify-between"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="font-[Poppins-Medium] text-[13px] text-[#9CA3AF]">
                        Lesson {index + 1}
                      </Text>
                      <Text className="font-[Poppins-SemiBold] text-[16px] text-[#0D132B] mt-0.5">
                        {lesson.title}
                      </Text>
                      <Text className="font-[Poppins-Regular] text-[12px] text-[#9CA3AF] mt-1">
                        0 / 6 lessons
                      </Text>
                    </View>

                    {/* Lock Icon in Gray Ring */}
                    <View className="w-7 h-7 rounded-full border border-[#D1D5DB] items-center justify-center bg-white">
                      <Ionicons
                        name="lock-closed-outline"
                        size={14}
                        color="#6B7280"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* ── Practice Tab Hub ───────────────────────────────────────── */
            <View className="px-5 pt-4 pb-12 gap-3.5">
              <Text className="font-[Poppins-Bold] text-[18px] text-[#0D132B]">
                Daily Practice Hub
              </Text>
              <Text className="font-[Poppins-Regular] text-[13px] text-[#6B7280] -mt-1">
                Reinforce your vocabulary, listening, and speaking skills.
              </Text>

              {/* Quick Review Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleLessonPress(unitLessons[0])}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View className="w-12 h-12 rounded-xl bg-[#EEF2FF] items-center justify-center">
                    <Ionicons name="flash-outline" size={24} color="#5B42F3" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-[Poppins-Bold] text-[16px] text-[#0F172A]">
                      Quick Review
                    </Text>
                    <Text className="font-[Poppins-Regular] text-[12px] text-[#64748B]">
                      5 min speed review of recent words
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Audio Listening Practice */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/(tabs)/ai-teacher")}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View className="w-12 h-12 rounded-xl bg-[#EFF6FF] items-center justify-center">
                    <Ionicons name="headset-outline" size={24} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-[Poppins-Bold] text-[16px] text-[#0F172A]">
                      Listening Comprehension
                    </Text>
                    <Text className="font-[Poppins-Regular] text-[12px] text-[#64748B]">
                      Listen to native AI dialogues
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>

              {/* Speaking Practice */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/(tabs)/chat")}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View className="w-12 h-12 rounded-xl bg-[#ECFDF5] items-center justify-center">
                    <Ionicons name="mic-outline" size={24} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-[Poppins-Bold] text-[16px] text-[#0F172A]">
                      Speaking & Conversation
                    </Text>
                    <Text className="font-[Poppins-Regular] text-[12px] text-[#64748B]">
                      Practice pronunciation with AI tutor
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ── Interactive Lesson Detail & Completion Modal ───────────────── */}
        <LessonDetailModal
          visible={selectedLesson !== null}
          lesson={selectedLesson}
          unitTitle={activeUnit.title}
          onClose={() => setSelectedLesson(null)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  cardTopicImage: {
    width: 60,
    height: 60,
  },
});
