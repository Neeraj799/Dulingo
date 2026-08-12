import { Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6 gap-6">
      <Text className="text-h1 text-center color-lingua-purple">Dulingo</Text>

      <Link href="/onboarding" asChild>
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-[#6C4EF5] px-6 py-3.5 rounded-full shadow-sm"
        >
          <Text className="text-white text-base font-[Poppins-SemiBold]">
            Open Onboarding Screen
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}