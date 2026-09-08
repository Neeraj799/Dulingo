import { useStreamClient } from "@/hooks/useStreamClient";
import { useLanguageStore } from "@/store/useLanguageStore";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { NativeModules, Platform } from "react-native";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env file");
}

// Safe tokenCache with lazy require to prevent top-level module evaluation crash in Expo Go
const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === "web") return null;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SecureStore = require("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === "web") return;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SecureStore = require("expo-secure-store");
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore secure store errors on unsupported clients
    }
  },
  async clearToken(key: string) {
    try {
      if (Platform.OS === "web") return;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SecureStore = require("expo-secure-store");
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore secure store errors on unsupported clients
    }
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const selectedLanguageCode = useLanguageStore((s) => s.selectedLanguageCode);
  const hasHydrated = useLanguageStore((s) => s.hasHydrated);

  useEffect(() => {
    if (isLoaded && hasHydrated) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [isLoaded, hasHydrated]);

  useEffect(() => {
    // Wait for both Clerk auth state and Zustand AsyncStorage rehydration.
    if (!isLoaded || !hasHydrated) return;

    const currentSegment = (segments[0] as string) || "";

    const inAuthFlow =
      currentSegment === "onboarding" ||
      currentSegment === "sign-up" ||
      currentSegment === "sign-in" ||
      currentSegment === "sso-callback";

    const inLanguageSelect = currentSegment === "language-select";
    const inEntryRoute = currentSegment === "" || currentSegment === "index";

    if (!isSignedIn) {
      // Unauthenticated users always go to onboarding.
      if (!inAuthFlow) {
        router.replace("/onboarding");
      }
      return;
    }

    // Signed-in user.
    if (inAuthFlow) {
      // Just signed in — send them through the language gate.
      if (selectedLanguageCode) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/language-select");
      }
      return;
    }

    if (!selectedLanguageCode && !inLanguageSelect) {
      // Signed-in but no language selected — force language selection.
      router.replace("/language-select");
      return;
    }

    if (selectedLanguageCode && inEntryRoute && !inLanguageSelect && !inAuthFlow) {
      // Signed-in with language — redirect to tabs.
      router.replace("/(tabs)/home");
    }

    // Signed-in with a language set: allow free navigation (including /language-select to change).
  }, [isLoaded, isSignedIn, segments, router, selectedLanguageCode, hasHydrated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

/**
 * Conditionally wraps children with `<StreamVideo>` when the native Stream
 * client is ready. On web the provider is skipped (the SDK is native-only).
 */
function StreamVideoProvider({ children }: { children: React.ReactNode }) {
  const { client } = useStreamClient();

  const [StreamVideoComponent, setStreamVideoComponent] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === "web" || !NativeModules?.WebRTCModule) return;

    import("@stream-io/video-react-native-sdk")
      .then((mod) => {
        setStreamVideoComponent(() => mod.StreamVideo);
      })
      .catch((err) => {
        console.warn("Failed to load StreamVideo SDK:", err);
      });
  }, []);

  // On web or while loading the SDK module, render children without the provider.
  if (Platform.OS === "web" || !StreamVideoComponent || !client) {
    return <>{children}</>;
  }

  return (
    <StreamVideoComponent client={client}>
      {children}
    </StreamVideoComponent>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} >
      <StreamVideoProvider>
        <InitialLayout />
      </StreamVideoProvider>
    </ClerkProvider>
  );
}
