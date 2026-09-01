import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { posthog } from "@/config/posthog";
import { images } from "../../constants/images";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    posthog?.capture("onboarding_started");
    router.push("/sign-up");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 px-6 pt-2 pb-6 justify-between max-w-md w-full self-center">
        {/* Top Header / App Branding */}
        <View className="flex-row items-center justify-center pt-2">
          <Image
            source={images.mascotLogo}
            style={{ width: 38, height: 38, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text className="onboarding-title">Fluento</Text>
        </View>

        {/* Hero Section: Headline & Subtitle */}
        <View className="mt-4">
          <Text className="onboarding-headline">
            Your AI language{"\n"}
            <Text className="color-lingua-purple">teacher</Text>.
          </Text>
          <Text className="text-body-lg text-[#6B7280] mt-3">
            Real conversations, personalized lessons, anytime, anywhere.
          </Text>
        </View>

        {/* Center Mascot Illustration with Floating Speech Bubbles */}
        <View className="flex-1 items-center justify-center relative my-3 w-full min-h-[280px]">
          {/* Speech Bubble 1: Hello! (Top Left) */}
          <View
            className="speech-bubble bg-[#EEF6FF] top-4 left-4 -rotate-6 shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-body-lg font-medium text-[#0D132B]">Hello!</Text>
            {/* Bubble Tail */}
            <View
              className="absolute -bottom-1 right-4 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#EEF6FF]"
            />
          </View>

          {/* Speech Bubble 2: ¡Hola! (Top Right) */}
          <View
            className="speech-bubble bg-[#F5F0FF] top-2 right-6 rotate-6 shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-body-lg font-medium color-lingua-purple">¡Hola!</Text>
            {/* Bubble Tail */}
            <View
              className="absolute -bottom-1 left-4 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#F5F0FF]"
            />
          </View>

          {/* Speech Bubble 3: 你好! (Middle Right) */}
          <View
            className="speech-bubble bg-[#FFF0F0] top-20 right-1 -rotate-3 shadow-sm"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-body-lg font-medium text-[#EF4444]">你好!</Text>
            {/* Bubble Tail */}
            <View
              className="absolute -left-1 top-3 w-0 h-0 border-t-[5px] border-b-[5px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#FFF0F0]"
            />
          </View>

          {/* Mascot Fox Image */}
          <Image
            source={images.mascotWelcome}
            style={{ width: "90%", height: 310, marginTop: 20 }}
            resizeMode="contain"
          />
        </View>

        {/* Bottom CTA Button */}
        <View className="mb-2">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGetStarted}
            className="bg-lingua-purple rounded-3xl h-[56px] px-6 flex-row items-center justify-between shadow-md"
            style={{
              backgroundColor: "#6C4EF5",
              shadowColor: "#6C4EF5",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="w-6" />
            <Text className="text-white text-lg font-semibold text-center flex-1">
              Get Started
            </Text>
            <View className="w-6 h-6 items-center justify-center">
              <Text className="text-white text-2xl font-bold leading-none">
                ›
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
