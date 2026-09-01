import { Ionicons } from "@expo/vector-icons";
import { type BottomTabBarProps } from "expo-router/tabs";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Tab configuration ────────────────────────────────────────────────────────

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: "home",       label: "Home",       icon: "home-outline",        iconActive: "home"        },
  { name: "learn",      label: "Learn",      icon: "book-outline",        iconActive: "book"        },
  { name: "ai-teacher", label: "AI Teacher", icon: "sparkles-outline",    iconActive: "sparkles"    },
  { name: "chat",       label: "Chat",       icon: "chatbubble-outline",  iconActive: "chatbubble"  },
  { name: "profile",    label: "Profile",    icon: "person-outline",      iconActive: "person"      },
];

const LINGUA_PURPLE = "#6C4EF5";
const INACTIVE_COLOR = "#9CA3AF";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    /*
     * Static layout + color properties → className.
     * Shadow properties (shadowColor / shadowOffset / shadowOpacity /
     * shadowRadius / elevation) must stay in StyleSheet — platform-specific
     * syntax is not expressible as a single className (exception rule).
     * paddingBottom is runtime (safe-area insets) → inline style.
     */
    <View
      className="flex-row bg-white border-t border-[#F0F0F0] pt-[10px]"
      style={[
        styles.shadow,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
      ]}
    >
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
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? tabConfig.label}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.75}
            className="flex-1 items-center justify-center gap-[3px]"
          >
            {/* Icon color is runtime (active/inactive) → Ionicons color prop */}
            <Ionicons
              name={isFocused ? tabConfig.iconActive : tabConfig.icon}
              size={24}
              color={isFocused ? LINGUA_PURPLE : INACTIVE_COLOR}
            />
            <Text
              className={`text-[10px] text-center ${
                isFocused
                  ? "font-[Poppins-SemiBold] text-[#6C4EF5]"
                  : "font-[Poppins-Regular] text-[#9CA3AF]"
              }`}
              numberOfLines={1}
            >
              {tabConfig.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── StyleSheet ──────────────────────────────────────────────────────────────
//
// Only items that CANNOT be expressed as className remain here:
//   shadow        — platform-specific shadow props (exception rule)

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
});
