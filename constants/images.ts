import androidIconBackground from "../assets/images/android-icon-background.png";
import androidIconForeground from "../assets/images/android-icon-foreground.png";
import androidIconMonochrome from "../assets/images/android-icon-monochrome.png";
import earth from "../assets/images/earth.png";
import expoBadgeWhite from "../assets/images/expo-badge-white.png";
import expoBadge from "../assets/images/expo-badge.png";
import expoLogo from "../assets/images/expo-logo.png";
import favicon from "../assets/images/favicon.png";
import icon from "../assets/images/icon.png";
import logoGlow from "../assets/images/logo-glow.png";
import mascotAuth from "../assets/images/mascot-auth.png";
import mascotWelcome from "../assets/images/mascot-welcome.png";
import mascotLogo from "../assets/images/moscot-logo.png";
import palace from "../assets/images/palace.png";
import streakFire from "../assets/images/streak-fire.png";
import treasure from "../assets/images/treasure.png";
import tutorialWeb from "../assets/images/tutorial-web.png";
import tabExplore from "../assets/images/tabIcons/explore.png";
import tabHome from "../assets/images/tabIcons/home.png";

export const images = {
  androidIconBackground,
  androidIconForeground,
  androidIconMonochrome,
  earth,
  expoBadgeWhite,
  expoBadge,
  expoLogo,
  favicon,
  icon,
  logoGlow,
  mascotAuth,
  mascotWelcome,
  mascotLogo,
  palace,
  streakFire,
  treasure,
  tutorialWeb,
  tab: {
    explore: tabExplore,
    home: tabHome,
  },
} as const;

export type Images = typeof images;
