import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Tab configuration ────────────────────────────────────────────────────────

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: "home",       label: "Home",       icon: "home-outline",      iconActive: "home"       },
  { name: "learn",      label: "Learn",      icon: "book-outline",      iconActive: "book"       },
  { name: "ai-teacher", label: "AI Teacher", icon: "sparkles-outline",  iconActive: "sparkles"   },
  { name: "chat",       label: "Chat",       icon: "chatbubble-outline", iconActive: "chatbubble" },
  { name: "profile",    label: "Profile",    icon: "person-outline",    iconActive: "person"     },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
const TAB_COUNT   = TABS.length;
const TAB_WIDTH   = SCREEN_WIDTH / TAB_COUNT;   // each tab = equal screen slice
const CIRCLE_SIZE = 44;
const LINGUA_PURPLE = "#6C4EF5";

// Horizontal centre of each tab slot, offset so the circle is centred.
function circleXFor(index: number) {
  return TAB_WIDTH * index + TAB_WIDTH / 2 - CIRCLE_SIZE / 2;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets      = useSafeAreaInsets();
  const activeIndex = state.index;

  // Reanimated shared value — lives on the UI thread, zero JS-thread lag.
  const translateX = useSharedValue(circleXFor(activeIndex));

  useEffect(() => {
    translateX.value = withSpring(circleXFor(activeIndex), {
      damping:   22,   // enough damping for a clean stop, no ringing
      stiffness: 260,  // snappy but not instant
      mass:      0.6,
    });
  }, [activeIndex, translateX]);

  const circleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    // Outer container: static styles via className, shadows + safe-area via style.
    <View
      className="bg-white border-t border-[#E5E7EB] pt-1.5"
      style={[
        styles.shadow,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 },
      ]}
    >
      {/*
        Tab row — the circle lives INSIDE this View so its `top: 0` is flush
        with the row's own top edge. No manual padding offset needed.
      */}
      <View style={styles.tabRow}>

        {/* ── Sliding circle ── */}
        <Animated.View
          className="bg-lingua-purple"
          style={[styles.circle, circleAnimStyle]}
        />

        {/* ── Tab buttons ── */}
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

          const onLongPress = () =>
            navigation.emit({ type: "tabLongPress", target: route.key });

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
              // className: alignment  |  style: runtime-constant dimensions
              className="items-center justify-center"
              style={styles.tabItem}
            >
              {isFocused ? (
                // Active — same size as the circle; icon is always centred.
                <View
                  className="items-center justify-center"
                  style={styles.activeIconBox}
                >
                  <Ionicons name={tabConfig.iconActive} size={22} color="#FFFFFF" />
                </View>
              ) : (
                // Inactive — icon + label stacked.
                <View className="items-center justify-center gap-[3px]">
                  <Ionicons name={tabConfig.icon} size={20} color="#9CA3AF" />
                  <Text
                    className="text-[10px] text-[#9CA3AF] text-center"
                    style={styles.labelFont}
                    numberOfLines={1}
                  >
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

// ─── StyleSheet — only what className cannot express ──────────────────────────
//
//  shadow       Platform shadow / elevation (iOS vs Android differ)
//  tabRow       Fixed height + relative positioning context for the circle
//  circle       Absolute pos, runtime size, borderRadius, platform shadow
//  tabItem      Runtime-constant width + height (TAB_WIDTH, CIRCLE_SIZE)
//  activeIconBox Runtime-constant size (CIRCLE_SIZE)
//  labelFont    Custom font family (not a Tailwind token)

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 12,
  },
  // tabRow is the positioning parent of the circle — `top: 0` aligns perfectly.
  tabRow: {
    flexDirection: "row",
    height: CIRCLE_SIZE + 2,   // enough room to centre the circle (44px) with 1px breathing space
  },
  circle: {
    position: "absolute",
    top: 1,                    // (CIRCLE_SIZE+2 - CIRCLE_SIZE) / 2 = 1 → vertically centred
    left: 0,                   // translateX drives horizontal position
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    // iOS glow
    shadowColor: LINGUA_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    // Android
    elevation: 10,
  },
  tabItem: {
    width: TAB_WIDTH,
    height: CIRCLE_SIZE + 2,
  },
  activeIconBox: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  labelFont: {
    fontFamily: "Poppins-Regular",
  },
});
