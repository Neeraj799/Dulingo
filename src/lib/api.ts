import { Platform } from "react-native";
import Constants from "expo-constants";

// getDevServer is available at runtime in React Native but omitted from TS definitions
const getDevServer = (
  require("react-native") as {
    getDevServer?: () => { url: string; bundleLoaded?: boolean };
  }
).getDevServer;

/**
 * Resolves an API endpoint path (e.g. "/stream-token") into a full URL
 * that works across Web, iOS, Android Emulators, and Physical Devices.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // On Web, browser native relative URLs work fine
  if (Platform.OS === "web") {
    return cleanPath;
  }

  // 1. Explicit API URL from environment variable (e.g. production backend or tunnel)
  if (process.env.EXPO_PUBLIC_API_URL) {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
    return `${baseUrl}${cleanPath}`;
  }

  // 2. Development mode: compute dev server host IP & port
  if (__DEV__) {
    try {
      if (typeof getDevServer === "function") {
        const devServer = getDevServer();
        if (devServer?.url) {
          const baseUrl = devServer.url.replace(/\/$/, "");
          return `${baseUrl}${cleanPath}`;
        }
      }
    } catch {
      // getDevServer may throw if bundler status is unavailable
    }

    // Fallback using Expo Constants hostUri (e.g., "192.168.1.73:8081")
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost;

    if (hostUri) {
      const host = hostUri.split(":")[0];
      return `http://${host}:8081${cleanPath}`;
    }
  }

  return cleanPath;
}
