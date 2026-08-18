import { Redirect } from "expo-router";

/**
 * The root index route redirects to the tabs layout.
 * Actual route guarding is handled by InitialLayout in _layout.tsx.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
