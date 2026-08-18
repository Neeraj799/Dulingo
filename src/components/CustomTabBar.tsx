import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Tab configuration ────────────────────────────────────────────────────────

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: "home", label: "Home", icon: "home-outline", iconActive: "home" },
  { name: "learn", label: "Learn", icon: "book-outline", iconActive: "book" },
  {
    name: "ai-teacher",
    label: "AI Teacher",
    icon: "sparkles-outline",
    iconActive: "sparkles",
  },
  {
    name: "chat",
    label: "Chat",
    icon: "chatbubble-outline",
    iconActive: "chatbubble",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person-outline",
    iconActive: "person",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_COUNT = TABS.length;
// Each tab occupies an equal slice of the full bar width
const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;
const CIRCLE_SIZE = 44;
const LINGUA_PURPLE = "#6C4EF5";

// Pre-compute the X value that perfectly centers the circle inside each tab slot
function getCircleX(index: number) {
  return TAB_WIDTH * index + TAB_WIDTH / 2 - CIRCLE_SIZE / 2;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;

  // Initialise at the correct position so there's no snap on first render
  const circleX = useRef(
    new Animated.Value(getCircleX(activeIndex))
  ).current;

  useEffect(() => {
    Animated.timing(circleX, {
      toValue: getCircleX(activeIndex),
      duration: 300,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, circleX]);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
      ]}
    >
      {/* ── Sliding circle — absolutely positioned behind tab icons ── */}
      <Animated.View
        style={[styles.circle, { transform: [{ translateX: circleX }] }]}
      />

      {/* ── Tab items ── */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const tabConfig = TABS.find((t) => t.name === route.name);
          if (!tabConfig) return null;

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? tabConfig.label
              }
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.75}
              style={styles.tabItem}
            >
              {isFocused ? (
                // Active — icon centred over the circle
                <View style={styles.activeIconWrapper}>
                  <Ionicons
                    name={tabConfig.iconActive}
                    size={22}
                    color="#FFFFFF"
                  />
                </View>
              ) : (
                // Inactive — icon + label
                <View style={styles.inactiveWrapper}>
                  <Ionicons name={tabConfig.icon} size={20} color="#9CA3AF" />
                  <Text style={styles.label} numberOfLines={1}>
                    {tabConfig.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
    // Lift shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 12,
  },
  // The circle sits at the very top of the container, no left offset —
  // translateX alone drives its horizontal position.
  circle: {
    position: "absolute",
    top: 6,
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: LINGUA_PURPLE,
    // Glow
    shadowColor: LINGUA_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  tabRow: {
    flexDirection: "row",
  },
  tabItem: {
    width: TAB_WIDTH,
    height: CIRCLE_SIZE + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  // Same size as the circle so the icon is perfectly centred over it
  activeIconWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
