import { Ionicons } from "@expo/vector-icons";
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
  { name: "home",       label: "Home",       icon: "home-outline",       iconActive: "home"        },
  { name: "learn",      label: "Learn",      icon: "book-outline",       iconActive: "book"        },
  { name: "ai-teacher", label: "AI Teacher", icon: "sparkles-outline",   iconActive: "sparkles"    },
  { name: "chat",       label: "Chat",       icon: "chatbubble-outline",  iconActive: "chatbubble"  },
  { name: "profile",    label: "Profile",    icon: "person-outline",     iconActive: "person"      },
];

const LINGUA_PURPLE = "#6C4EF5";

// Inline props type to avoid external package dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomTabBarProps = any;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
      ]}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {state.routes.map((route: { key: string; name: string }, index: number) => {
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
            accessibilityLabel={options.tabBarAccessibilityLabel ?? tabConfig.label}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.75}
            style={styles.tabItem}
          >
            <Ionicons
              name={isFocused ? tabConfig.iconActive : tabConfig.icon}
              size={24}
              color={isFocused ? LINGUA_PURPLE : "#9CA3AF"}
            />
            <Text
              style={[
                styles.label,
                { color: isFocused ? LINGUA_PURPLE : "#9CA3AF" },
                isFocused && styles.labelActive,
              ]}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: 10,
    textAlign: "center",
  },
  labelActive: {
    fontFamily: "Poppins-SemiBold",
  },
});
