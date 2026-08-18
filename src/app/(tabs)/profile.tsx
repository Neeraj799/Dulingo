import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center gap-3">
        <Text className="font-[Poppins-Bold] text-[28px] text-[#6C4EF5]">Profile</Text>
        <Text className="font-[Poppins-Regular] text-[14px] text-[#6B7280]">
          User profile coming soon…
        </Text>
      </View>
    </SafeAreaView>
  );
}
