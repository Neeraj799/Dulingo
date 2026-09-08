import { posthog } from "@/config/posthog";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { useLanguageStore } from "@/store/useLanguageStore";
import type { Language, LanguageCode } from "@/types/learning";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LanguageSelectScreen() {
  const router = useRouter();
  const { user } = useUser();
  const setSelectedLanguage = useLanguageStore((s) => s.setSelectedLanguage);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<LanguageCode | null>(null);

  const filteredLanguages = languages.filter((lang) => {
    const q = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q)
    );
  });

  const availableLanguages = filteredLanguages.filter((l) => l.isAvailable);
  const comingSoonLanguages = filteredLanguages.filter((l) => !l.isAvailable);
  const hasResults = filteredLanguages.length > 0;

  const selectedLanguage = languages.find((l) => l.code === selectedCode);

  const handleConfirm = () => {
    if (!selectedCode) return;
    // Persist the chosen language to AsyncStorage via Zustand store.
    setSelectedLanguage(selectedCode);
    posthog?.capture("language_selected", {
      language_code: selectedCode,
      language_name: selectedLanguage?.name || "",
    });
    if (user?.id) {
      posthog?.identify(user.id, {
        preferred_language: selectedCode,
      });
    }
    router.replace("/");
  };

  const renderLanguageItem = (item: Language) => {
    const isSelected = selectedCode === item.code;

    return (
      <TouchableOpacity
        key={item.code}
        activeOpacity={0.75}
        onPress={() => setSelectedCode(isSelected ? null : item.code)}
        // Runtime state (selected border colour + bg) kept in StyleSheet;
        // static base layout via className.
        className="flex-row items-center py-[13px] px-[14px] bg-white rounded-2xl mb-1.5 border border-[#F3F4F6]"
        style={isSelected ? styles.rowSelected : undefined}
        disabled={!item.isAvailable}
      >
        {/* Flag */}
        <Image
          source={{ uri: item.flag }}
          className="w-[46px] h-[46px] rounded-full border border-[#E5E7EB] bg-[#F6F7FB]"
          resizeMode="cover"
        />

        {/* Name + learner count */}
        <View className="flex-1 ml-3.5">
          <Text
            className={`font-[Poppins-SemiBold] text-[15px] mb-[1px] ${
              item.isAvailable ? "text-[#0D132B]" : "text-[#9CA3AF]"
            }`}
          >
            {item.name}
          </Text>
          <Text className="font-[Poppins-Regular] text-[12px] text-[#6B7280]">
            {item.isAvailable ? (item.learnerCount ?? "") : "Coming soon"}
          </Text>
        </View>

        {/* Right indicator */}
        {item.isAvailable ? (
          isSelected ? (
            <View className="w-7 h-7 rounded-full bg-[#6C4EF5] items-center justify-center">
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          )
        ) : (
          <View className="bg-[#F3F4F6] rounded-full px-2.5 py-1">
            <Text className="font-[Poppins-Medium] text-[11px] text-[#9CA3AF]">
              Soon
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#0D132B" />
        </TouchableOpacity>

        <Text className="font-[Poppins-SemiBold] text-[18px] text-[#0D132B]">
          Choose a language
        </Text>

        {/* spacer keeps title centred */}
        <View className="w-9" />
      </View>

      {/* ── Search Bar ── */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center bg-[#F6F7FB] rounded-full px-4 py-[13px] border border-[#E5E7EB]">
          <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          {/* TextInput — approved StyleSheet exception (platform input props) */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search languages"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ── Scrollable list ── */}
      {/* ScrollView contentContainerStyle — approved StyleSheet exception */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Empty state */}
        {!hasResults && (
          <View className="flex-1 items-center justify-center px-8 pt-16">
            <Text className="text-[40px] mb-3">🔍</Text>
            <Text className="font-[Poppins-SemiBold] text-[16px] text-[#0D132B] text-center mb-1">
              No languages found
            </Text>
            <Text className="font-[Poppins-Regular] text-[13px] text-[#6B7280] text-center">
              Try searching in English or the native script, e.g. &quot;Español&quot; or &quot;日本語&quot;.
            </Text>
          </View>
        )}

        {/* Available languages */}
        {availableLanguages.length > 0 && (
          <View className="px-4 mb-2">
            <Text className="font-[Poppins-Bold] text-[15px] text-[#0D132B] mb-2.5">
              Popular
            </Text>
            {availableLanguages.map(renderLanguageItem)}
          </View>
        )}

        {/* Coming soon languages */}
        {comingSoonLanguages.length > 0 && (
          <View className="px-4 mb-2">
            <Text className="font-[Poppins-Bold] text-[15px] text-[#0D132B] mb-2.5">
              Coming Soon
            </Text>
            {comingSoonLanguages.map(renderLanguageItem)}
          </View>
        )}

        {/* ── Confirm Button ── */}
        <View className="px-4 pt-2">
          <TouchableOpacity
            disabled={!selectedCode}
            activeOpacity={0.85}
            onPress={handleConfirm}
            className={`rounded-full py-4 items-center ${
              selectedCode ? "bg-[#6C4EF5]" : "bg-[#E5E7EB]"
            }`}
            // Platform shadow — approved StyleSheet exception
            style={selectedCode ? styles.confirmShadow : undefined}
          >
            <Text
              className={`font-[Poppins-SemiBold] text-[16px] ${
                selectedCode ? "text-white" : "text-[#9CA3AF]"
              }`}
            >
              {selectedLanguage
                ? `Start Learning ${selectedLanguage.name}`
                : "Select a language"}
            </Text>
          </TouchableOpacity>

          {/* Earth illustration */}
          <Image
            source={images.earth}
            className="w-full mt-7"
            style={styles.earthImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView — className not supported
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // TextInput — platform-specific input reset
  searchInput: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#0D132B",
    padding: 0,
  },

  // ScrollView contentContainerStyle — must use StyleSheet
  scrollContent: {
    paddingBottom: 32,
  },

  // Runtime state — selected row border (1.5px + colour swap, not achievable statically)
  rowSelected: {
    backgroundColor: "#F0ECFF",
    borderColor: "#6C4EF5",
    borderWidth: 1.5,
  },

  // Platform shadow on confirm button — iOS/Android syntax differs
  confirmShadow: {
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // Image height — percentage width + fixed height needs StyleSheet
  earthImage: {
    height: 200,
  },
});
