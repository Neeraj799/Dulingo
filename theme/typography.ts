export const fontFamily = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 38.4,
    fontWeight: "700" as const,
    description: "Page / Screen Title",
  },
  h2: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    lineHeight: 31.2,
    fontWeight: "600" as const,
    description: "Section Title",
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600" as const,
    description: "Card / Module Title",
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22.4,
    fontWeight: "500" as const,
    description: "Subheading",
  },
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 25.6,
    fontWeight: "400" as const,
    description: "Important content",
  },
  bodyMd: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 22.4,
    fontWeight: "400" as const,
    description: "Body text",
  },
  bodySm: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20.8,
    fontWeight: "400" as const,
    description: "Supporting text",
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15.4,
    fontWeight: "400" as const,
    description: "Labels, meta text",
  },
} as const;

export type Typography = typeof typography;
