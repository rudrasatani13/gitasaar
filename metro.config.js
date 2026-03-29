const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable file watching to avoid ENOSPC error
config.watchFolders = [];
config.resetCache = true;

// Ignore android/ios platform files to reduce watchers
config.resolver.blacklistRE = /(android|ios|\.expo|\.git|node_modules\/.*\/android|node_modules\/.*\/ios)\/.*/;

module.exports = config;
