import { colors } from "./colors";
import { fontFamily, typography } from "./typography";

export const theme = {
  colors,
  fontFamily,
  typography,
} as const;

export { colors, fontFamily, typography };
export type Theme = typeof theme;
