import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
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
            Welcome back, {user.primaryEmailAddress?.emailAddress || user.firstName || "Learner"}!
          </Text>
        ) : null}

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