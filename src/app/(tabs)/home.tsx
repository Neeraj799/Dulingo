import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { useLanguageStore, useSelectedLanguage } from "@/store/useLanguageStore";
import { useProgressStore } from "@/store/useProgressStore";

// ─── Today's plan items ──────────────────────────────────────────────────────

type PlanItem = {
  id: string;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  completed: boolean;
};

function buildTodaysPlan(
  languageCode: string | null,
  completedLessonIds: string[]
): PlanItem[] {
  if (!languageCode) return [];

  const langUnits = units.filter((u) => u.languageCode === languageCode);
  const langLessons = lessons
    .filter((l) => l.languageCode === languageCode)
    .slice(0, 3);

  const plan: PlanItem[] = [];

  if (langLessons[0]) {
    plan.push({
      id: langLessons[0].id,
      title: "Lesson",
      subtitle: langLessons[0].title,
      iconName: "book",
      iconBg: "#6C4EF5",
      completed: completedLessonIds.includes(langLessons[0].id),
    });
  }

  plan.push({
    id: "ai-conversation",
    title: "AI Conversation",
    subtitle: "Talk about your day",
    iconName: "headset",
    iconBg: "#4D8BFF",
    completed: false,
  });

  plan.push({
    id: "new-words",
    title: "New words",
    subtitle:
      langLessons[1]
        ? `${langLessons[1].vocabulary?.length ?? 5} words`
        : "5 words",
    iconName: "chatbubbles",
    iconBg: "#FF5B5B",
    completed: false,
  });

  return plan;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const selectedLanguage = useSelectedLanguage();
  const selectedLanguageCode = useLanguageStore((s) => s.selectedLanguageCode);

  const { dailyXP, dailyXPGoal, streak, completedLessonIds } =
    useProgressStore();

  const displayName =
    user?.firstName ||
    user?.fullName?.split(" ")[0] ||
    "Learner";

  // Current lesson = first non-completed lesson for the language
  const currentUnit = units.find(
    (u) => u.languageCode === selectedLanguageCode
  );
  const allLangLessons = lessons.filter(
    (l) => l.languageCode === selectedLanguageCode
  );
  const currentLesson =
    allLangLessons.find((l) => !completedLessonIds.includes(l.id)) ??
    allLangLessons[0];
  const currentUnitIndex = currentUnit ? currentUnit.order : 1;

  const todaysPlan = buildTodaysPlan(selectedLanguageCode, completedLessonIds);
  const xpProgress = Math.min(dailyXP / dailyXPGoal, 1);

  // Greeting word in selected language
  const greetingWord =
    selectedLanguageCode === "es"
      ? "¡Hola"
      : selectedLanguageCode === "fr"
      ? "Bonjour"
      : selectedLanguageCode === "ja"
      ? "こんにちは"
      : "Hello";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
          {/* Left: flag + greeting */}
          <View className="flex-row items-center gap-3">
            {selectedLanguage?.flag ? (
              <Image
                source={{ uri: selectedLanguage.flag }}
                style={styles.flagImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.flagPlaceholder} className="bg-[#E5E7EB] rounded-full items-center justify-center">
                <Text className="text-[18px]">🌐</Text>
              </View>
            )}
            <Text className="font-[Poppins-Bold] text-[18px] text-[#0D132B]">
              {greetingWord}, {displayName}! 👋
            </Text>
          </View>

          {/* Right: streak + bell */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Image
                source={images.streakFire}
                style={styles.streakIcon}
                contentFit="contain"
              />
              <Text className="font-[Poppins-Bold] text-[16px] text-[#0D132B]">
                {streak}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={24} color="#0D132B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Daily Goal Card ───────────────────────────────────────────────── */}
        <View className="mx-5 mt-3 mb-4 rounded-3xl overflow-hidden" style={styles.goalCard}>
          <View className="flex-row items-center justify-between px-5 py-5">
            {/* Text + bar */}
            <View className="flex-1 pr-4">
              <Text className="font-[Poppins-Regular] text-[13px] text-[#7C6A55]">
                Daily goal
              </Text>
              <Text className="font-[Poppins-Bold] text-[28px] text-[#0D132B] leading-tight">
                {dailyXP}{" "}
                <Text className="font-[Poppins-Regular] text-[16px] text-[#7C6A55]">
                  / {dailyXPGoal} XP
                </Text>
              </Text>
              {/* Progress bar */}
              <View className="mt-3 rounded-full overflow-hidden" style={styles.progressTrack}>
                <View
                  className="rounded-full"
                  style={[styles.progressFill, { width: `${xpProgress * 100}%` }]}
                />
              </View>
            </View>
            {/* Treasure image */}
            <Image
              source={images.treasure}
              style={styles.treasureImage}
              contentFit="contain"
            />
          </View>
        </View>

        {/* ── Continue Learning Card ────────────────────────────────────────── */}
        {selectedLanguage && (
          <View className="mx-5 mb-5 rounded-3xl overflow-hidden" style={styles.continueCard}>
            {/* Content */}
            <View className="flex-row items-stretch">
              <View className="flex-1 px-6 pt-5 pb-6 justify-between">
                <View>
                  <Text className="font-[Poppins-Regular] text-[13px] text-white/80">
                    Continue learning
                  </Text>
                  <Text className="font-[Poppins-Bold] text-[28px] text-white leading-tight mt-0.5">
                    {selectedLanguage.name}
                  </Text>
                  <Text className="font-[Poppins-Medium] text-[14px] text-white/80 mt-0.5">
                    A1 • Unit {currentUnitIndex}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/learn")}
                  className="self-start mt-5 bg-white rounded-full px-6 py-2.5"
                >
                  <Text className="font-[Poppins-SemiBold] text-[15px] text-lingua-purple">
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Palace illustration */}
              <View className="justify-end" style={styles.palaceContainer}>
                <Image
                  source={images.palace}
                  style={styles.palaceImage}
                  contentFit="contain"
                />
              </View>
            </View>
          </View>
        )}

        {/* ── Today's Plan ──────────────────────────────────────────────────── */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-[Poppins-Bold] text-[18px] text-[#0D132B]">
              Today's plan
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="font-[Poppins-SemiBold] text-[14px] text-lingua-purple">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Plan items */}
          <View className="gap-2">
            {todaysPlan.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                className="flex-row items-center gap-4 py-3 px-1"
              >
                {/* Icon */}
                <View
                  className="items-center justify-center rounded-2xl"
                  style={[styles.planIconBox, { backgroundColor: item.iconBg }]}
                >
                  <Ionicons name={item.iconName} size={22} color="#FFFFFF" />
                </View>

                {/* Text */}
                <View className="flex-1">
                  <Text className="font-[Poppins-SemiBold] text-[15px] text-[#0D132B]">
                    {item.title}
                  </Text>
                  <Text className="font-[Poppins-Regular] text-[13px] text-[#9CA3AF]">
                    {item.subtitle}
                  </Text>
                </View>

                {/* Status */}
                {item.completed ? (
                  <View
                    className="items-center justify-center rounded-full bg-lingua-purple"
                    style={styles.statusCircle}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <View
                    className="rounded-full border-2 border-[#E5E7EB]"
                    style={styles.statusCircle}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── StyleSheet ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  flagImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  flagPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  streakIcon: {
    width: 22,
    height: 22,
  },
  // Daily goal card
  goalCard: {
    backgroundColor: "#FDF6ED",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#EBD9C3",
  },
  progressFill: {
    height: 10,
    backgroundColor: "#FF8A00",
  },
  treasureImage: {
    width: 90,
    height: 90,
  },
  // Continue learning card
  continueCard: {
    backgroundColor: "#6C4EF5",
  },
  palaceContainer: {
    width: 140,
    overflow: "hidden",
  },
  palaceImage: {
    width: 140,
    height: 160,
    marginBottom: -8,
  },
  // Plan items
  planIconBox: {
    width: 52,
    height: 52,
  },
  statusCircle: {
    width: 30,
    height: 30,
  },
});
