import { ActivityIndicator, Text, View } from "react-native";

/**
 * SSO Callback Route — /sso-callback
 *
 * After a browser-based OAuth flow (Google, Facebook, Apple), Clerk redirects
 * the popup/browser tab here. ClerkProvider in the root layout automatically
 * calls WebBrowser.maybeCompleteAuthSession() which closes the popup and
 * passes the OAuth result back to the startSSOFlow() caller in the main window.
 *
 * This screen just needs to exist and render — no manual session handling needed.
 */
export default function SSOCallbackScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      <ActivityIndicator size="large" color="#6C4EF5" />
      <Text
        style={{
          marginTop: 16,
          fontFamily: "Poppins-Medium",
          fontSize: 15,
          color: "#6B7280",
        }}
      >
        Completing sign in...
      </Text>
    </View>
  );
}
