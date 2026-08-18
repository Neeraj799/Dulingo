import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import type { Language } from "@/types/learning";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show all languages in one list — unavailable ones get a "Soon" badge

  const selectedLanguage = languages.find((l) => l.code === selectedCode);

  const handleConfirm = () => {
    if (!selectedCode) return;
    // TODO: persist selection via Zustand store
    router.replace("/");
  };

  const renderLanguageItem = (item: Language) => {
    const isSelected = selectedCode === item.code;

    return (
      <TouchableOpacity
        key={item.code}
        activeOpacity={0.75}
        onPress={() => setSelectedCode(isSelected ? null : item.code)}
        style={[
          styles.languageRow,
          isSelected && styles.languageRowSelected,
          !item.isAvailable && styles.languageRowDisabled,
        ]}
        disabled={!item.isAvailable}
      >
        {/* Flag */}
        <Image
          source={{ uri: item.flag }}
          style={styles.flagImage}
          resizeMode="cover"
        />

        {/* Name + learner count */}
        <View style={styles.languageInfo}>
          <Text
            style={[
              styles.languageName,
              !item.isAvailable && styles.textMuted,
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.languageSub}>
            {item.isAvailable
              ? item.learnerCount ?? ""
              : "Coming soon"}
          </Text>
        </View>

        {/* Right indicator */}
        {item.isAvailable ? (
          isSelected ? (
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          )
        ) : (
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>Soon</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#0D132B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a language</Text>
        {/* spacer to keep title centred */}
        <View style={{ width: 36 }} />
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginRight: 8 }}
          />
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All languages — popular + coming soon in one list */}
        {filteredLanguages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular</Text>
            {filteredLanguages.map(renderLanguageItem)}
          </View>
        )}

        {/* ── Confirm Button ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={selectedCode ? 0.85 : 1}
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              !selectedCode && styles.confirmButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.confirmButtonText,
                !selectedCode && styles.confirmButtonTextDisabled,
              ]}
            >
              {selectedLanguage
                ? `Start Learning ${selectedLanguage.name}`
                : "Select a language"}
            </Text>
          </TouchableOpacity>

          {/* Earth illustration */}
          <Image
            source={images.earth}
            style={styles.earthImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#0D132B",
  },

  // ── Search
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#0D132B",
    padding: 0,
  },

  // ── List
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    color: "#0D132B",
    marginBottom: 10,
  },

  // ── Language row
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  languageRowSelected: {
    backgroundColor: "#F0ECFF",
    borderColor: "#6C4EF5",
    borderWidth: 1.5,
  },
  languageRowDisabled: {
    // no dimming — keep same visual weight as design
  },
  flagImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F6F7FB",
  },
  languageInfo: {
    flex: 1,
    marginLeft: 14,
  },
  languageName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#0D132B",
    marginBottom: 1,
  },
  languageSub: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#6B7280",
  },
  textMuted: {
    color: "#9CA3AF",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6C4EF5",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Footer
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  confirmButton: {
    backgroundColor: "#6C4EF5",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  confirmButtonTextDisabled: {
    color: "#9CA3AF",
  },
  earthImage: {
    width: "100%",
    height: 200,
    marginTop: 28,
  },
  soonBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  soonBadgeText: {
    fontFamily: "Poppins-Medium",
    fontSize: 11,
    color: "#9CA3AF",
  },
});
