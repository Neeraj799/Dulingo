import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { images } from "../../constants/images";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header / App Branding */}
        <View style={styles.header}>
          <Image
            source={images.mascotLogo}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Dulingo</Text>
        </View>

        {/* Hero Section: Headline & Subtitle */}
        <View style={styles.heroSection}>
          <Text style={styles.headline}>
            Your AI language{"\n"}
            <Text style={styles.headlineHighlight}>teacher</Text>.
          </Text>
          <Text style={styles.subtitle}>
            Real conversations, personalized lessons, anytime, anywhere.
          </Text>
        </View>

        {/* Center Mascot Illustration with Floating Speech Bubbles */}
        <View style={styles.mascotContainer}>
          {/* Speech Bubble 1: Hello! (Top Left) */}
          <View style={[styles.speechBubble, styles.bubble1]}>
            <Text style={styles.bubbleText1}>Hello!</Text>
            <View style={styles.bubbleTail1} />
          </View>

          {/* Speech Bubble 2: ¡Hola! (Top Right) */}
          <View style={[styles.speechBubble, styles.bubble2]}>
            <Text style={styles.bubbleText2}>¡Hola!</Text>
            <View style={styles.bubbleTail2} />
          </View>

          {/* Speech Bubble 3: 你好! (Middle Right) */}
          <View style={[styles.speechBubble, styles.bubble3]}>
            <Text style={styles.bubbleText3}>你好!</Text>
            <View style={styles.bubbleTail3} />
          </View>

          {/* Mascot Fox Image */}
          <Image
            source={images.mascotWelcome}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          >
            <View style={styles.buttonSpacer} />
            <Text style={styles.buttonText}>Get Started</Text>
            <View style={styles.iconContainer}>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: "space-between",
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  logoImage: {
    width: 38,
    height: 38,
    marginRight: 8,
  },
  logoText: {
    fontFamily: "Poppins-Bold",
    fontSize: 26,
    color: "#0D132B",
    letterSpacing: -0.5,
  },
  heroSection: {
    marginTop: 16,
  },
  headline: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    lineHeight: 40,
    color: "#0D132B",
    letterSpacing: -0.5,
  },
  headlineHighlight: {
    color: "#6C4EF5",
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginTop: 12,
  },
  mascotContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 12,
    width: "100%",
    minHeight: 280,
  },
  speechBubble: {
    position: "absolute",
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  bubble1: {
    top: 15,
    left: 15,
    backgroundColor: "#EEF6FF",
    transform: [{ rotate: "-4deg" }],
  },
  bubbleText1: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#0D132B",
  },
  bubbleTail1: {
    position: "absolute",
    bottom: -5,
    right: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#EEF6FF",
  },
  bubble2: {
    top: 5,
    right: 25,
    backgroundColor: "#F5F0FF",
    transform: [{ rotate: "5deg" }],
  },
  bubbleText2: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#6C4EF5",
  },
  bubbleTail2: {
    position: "absolute",
    bottom: -5,
    left: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#F5F0FF",
  },
  bubble3: {
    top: 80,
    right: 5,
    backgroundColor: "#FFF0F0",
    transform: [{ rotate: "-3deg" }],
  },
  bubbleText3: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#EF4444",
  },
  bubbleTail3: {
    position: "absolute",
    left: -5,
    top: 12,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 6,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#FFF0F0",
  },
  mascotImage: {
    width: "90%",
    height: 310,
    marginTop: 20,
  },
  buttonContainer: {
    marginBottom: 8,
  },
  getStartedButton: {
    backgroundColor: "#6C4EF5",
    borderRadius: 22,
    height: 56,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSpacer: {
    width: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    lineHeight: 28,
  },
});
