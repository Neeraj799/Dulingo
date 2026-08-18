import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguageStore, useSelectedLanguage } from "@/store/useLanguageStore";

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const clearSelectedLanguage = useLanguageStore((s) => s.clearSelectedLanguage);
  const selectedLanguage = useSelectedLanguage();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/onboarding");
  };

  const handleClearLanguage = async () => {
    await clearSelectedLanguage();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 justify-center items-center bg-white px-6 gap-6">
        <Text className="text-h1 text-center text-[#6C4EF5]">Home</Text>

        {user ? (
          <Text className="font-[Poppins-Medium] text-[16px] text-[#0D132B] text-center">
            Welcome back,{" "}
            {user.firstName ||
              user.fullName ||
              user.primaryEmailAddress?.emailAddress ||
              "Learner"}
            !
          </Text>
        ) : null}

        {selectedLanguage ? (
          <View className="w-full bg-[#F0ECFF] rounded-3xl px-6 py-4 items-center gap-3">
            <Text className="font-[Poppins-Bold] text-[18px] text-[#0D132B]">
              Learning: {selectedLanguage.name}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/language-select")}
              className="w-full flex-row items-center justify-center gap-2 bg-[#6C4EF5] rounded-full py-3"
            >
              <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
              <Text className="font-[Poppins-SemiBold] text-[15px] text-white">
                Change Language
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleClearLanguage}
          className="w-full flex-row items-center gap-3 bg-[#FFF7ED] border border-[#FED7AA] px-5 py-4 rounded-2xl"
        >
          <Ionicons name="trash-outline" size={20} color="#F97316" />
          <View className="flex-1">
            <Text className="font-[Poppins-SemiBold] text-[14px] text-[#F97316]">
              Clear Language (Test)
            </Text>
            <Text className="font-[Poppins-Regular] text-[12px] text-[#9CA3AF]">
              Resets language selection state
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          className="bg-[#EF4444] px-6 py-3.5 rounded-full"
        >
          <Text className="text-white text-base font-[Poppins-SemiBold]">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
