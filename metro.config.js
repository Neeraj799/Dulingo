const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude extraneous nested directories to prevent out-of-memory errors in Metro's file watcher
const existingBlockList = Array.isArray(config.resolver?.blockList)
  ? config.resolver.blockList
  : config.resolver?.blockList
  ? [config.resolver.blockList]
  : [];

config.resolver.blockList = [
  ...existingBlockList,
  /.*[/\\]my-expo-app[/\\].*/,
  /.*[/\\]vision-agent[/\\].*/,
];

module.exports = withNativewind(config);
