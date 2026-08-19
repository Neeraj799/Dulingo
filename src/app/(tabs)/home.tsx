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
    subtitle: langLessons[1]
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

  const currentUnit = units.find(
    (u) => u.languageCode === selectedLanguageCode
  );
  const allLangLessons = lessons.filter(
    (l) => l.languageCode === selectedLanguageCode
  );
  // currentLesson retained for future use (lesson screen integration)
  const _currentLesson =
    allLangLessons.find((l) => !completedLessonIds.includes(l.id)) ??
    allLangLessons[0];
  const currentUnitIndex = currentUnit ? currentUnit.order : 1;

  const todaysPlan = buildTodaysPlan(selectedLanguageCode, completedLessonIds);
  const xpProgress = Math.min(dailyXP / dailyXPGoal, 1);

  const greetingWord =
    selectedLanguageCode === "es"
      ? "¡Hola"
      : selectedLanguageCode === "fr"
        ? "Bonjour"
        : selectedLanguageCode === "ja"
          ? "こんにちは"
          : "Hello";

  return (
    // SafeAreaView: className not supported — keep inline style (exception rule)
    <SafeAreaView style={styles.safeArea}>
      {/*
        ScrollView: contentContainerStyle and style props are not className-able
        on ScrollView (exception rule) — kept as StyleSheet refs.
      */}
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
              // expo-image: dimensions must stay in style prop
              <Image
                source={{ uri: selectedLanguage.flag }}
                style={styles.flagImage}
                contentFit="cover"
              />
            ) : (
              <View className="w-[42px] h-[42px] rounded-full bg-[#E5E7EB] items-center justify-center">
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
              {/* expo-image: dimensions must stay in style prop */}
              <Image
                source={images.streakFire}
                style={styles.streakIcon}
                contentFit="contain"
              />
              <Text className="font-[Poppins-Bold] text-[16px] text-[#0D132B]">
                {streak}
              </Text>
            </View>
            <View>
              <Ionicons name="notifications-outline" size={24} color="#0D132B" />
            </View>
          </View>
        </View>

        {/* ── Daily Goal Card ───────────────────────────────────────────────── */}
        <View className="mx-5 mt-3 mb-4 rounded-3xl overflow-hidden bg-[#FDF6ED]">
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
              {/* Progress bar track — static bg + height → className */}
              <View className="mt-3 h-[10px] rounded-full overflow-hidden bg-[#EBD9C3]">
                {/* Fill width is runtime (xpProgress) → inline style */}
                <View
                  className="h-[10px] rounded-full bg-[#FF8A00]"
                  style={{ width: `${xpProgress * 100}%` }}
                />
              </View>
            </View>
            {/* expo-image: dimensions must stay in style prop */}
            <Image
              source={images.treasure}
              style={styles.treasureImage}
              contentFit="contain"
            />
          </View>
        </View>

        {/* ── Continue Learning Card ────────────────────────────────────────── */}
        {selectedLanguage && (
          <View className="mx-5 mb-5 rounded-3xl overflow-hidden bg-lingua-purple">
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
              {/* Palace illustration — w-[140px] overflow-hidden via className */}
              <View className="w-[140px] overflow-hidden justify-end">
                {/* expo-image: dimensions must stay in style prop */}
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
              {"Today's plan"}
            </Text>
            <View>
              <Text className="font-[Poppins-SemiBold] text-[14px] text-lingua-purple">
                View all
              </Text>
            </View>
          </View>

          {/* Plan items */}
          <View className="gap-2">
            {todaysPlan.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                className="flex-row items-center gap-4 py-3 px-1"
                onPress={() => {
                  if (item.id === "ai-conversation") {
                    router.push("/(tabs)/ai-teacher");
                  } else if (item.id === "new-words") {
                    router.push("/(tabs)/chat");
                  } else {
                    router.push("/(tabs)/learn");
                  }
                }}
              >
                {/* Icon box — static w/h → className; bg is runtime → inline */}
                <View
                  className="w-[52px] h-[52px] items-center justify-center rounded-2xl"
                  style={{ backgroundColor: item.iconBg }}
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

                {/* Status indicator */}
                {item.completed ? (
                  <View className="w-[30px] h-[30px] items-center justify-center rounded-full bg-lingua-purple">
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                ) : (
                  <View className="w-[30px] h-[30px] rounded-full border-2 border-[#E5E7EB]" />
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
//
// Only items that CANNOT be expressed as className remain here:
//   safeArea     — SafeAreaView does not support className (exception rule)
//   scroll       — ScrollView `style` prop (exception rule)
//   scrollContent — ScrollView `contentContainerStyle` prop (exception rule)
//   flagImage    — expo-image requires dimensions in `style` prop
//   streakIcon   — expo-image requires dimensions in `style` prop
//   treasureImage — expo-image requires dimensions in `style` prop
//   palaceImage  — expo-image requires dimensions in `style` prop (+ negative margin)

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
  // expo-image dimensions
  flagImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  streakIcon: {
    width: 22,
    height: 22,
  },
  treasureImage: {
    width: 90,
    height: 90,
  },
  palaceImage: {
    width: 140,
    height: 160,
    marginBottom: -8,
  },
});
