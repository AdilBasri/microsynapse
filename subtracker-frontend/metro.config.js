const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const polyfillFile = path.resolve(__dirname, 'polyfills.js');
const originalGetModulesRunBeforeMainModule = config.serializer.getModulesRunBeforeMainModule;

config.serializer.getModulesRunBeforeMainModule = (entryFilePath) => {
  const modules = typeof originalGetModulesRunBeforeMainModule === 'function'
    ? originalGetModulesRunBeforeMainModule(entryFilePath)
    : [];
  return [polyfillFile, ...modules];
};

module.exports = config;
