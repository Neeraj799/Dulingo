import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/onboarding");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 justify-center items-center bg-white px-6 gap-6">
        <Text className="text-h1 text-center text-[#6C4EF5]">Fluento</Text>

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

        {/* Choose a Language — entry point to language selection screen */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/language-select")}
          className="w-full flex-row items-center gap-4 bg-[#F0ECFF] px-5 py-4 rounded-2xl"
        >
          <View className="w-11 h-11 rounded-full bg-[#6C4EF5] items-center justify-center">
            <Ionicons name="globe-outline" size={22} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="font-[Poppins-SemiBold] text-[15px] text-[#0D132B]">
              Choose a Language
            </Text>
            <Text className="font-[Poppins-Regular] text-[13px] text-[#6B7280]">
              Pick what you want to learn
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6C4EF5" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          className="bg-[#EF4444] px-6 py-3.5 rounded-full shadow-sm"
        >
          <Text className="text-white text-base font-[Poppins-SemiBold]">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
